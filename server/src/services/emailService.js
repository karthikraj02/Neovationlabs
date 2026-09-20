// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const nodemailer = require("nodemailer");
const { smtp, email: emailConfig } = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!smtp.host || !smtp.user || !smtp.password) return null;

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.password },
  });
  return transporter;
}

const RESEND_TIMEOUT_MS = 10000;

// "onboarding@resend.dev" -> "NeovationLabs <onboarding@resend.dev>"; an address
// that already has a display name is left alone.
function displayFrom(address) {
  return address.includes("<") ? address : `NeovationLabs <${address}>`;
}

// Resend's error replies are JSON like {"message":"..."}. Only the status and that
// message are kept, never the API key or the request.
async function resendFailure(to, res) {
  let detail = "";
  try {
    const body = await res.json();
    detail = String(body.message || "");
  } catch {
    // not JSON; fall through with just the status
  }
  return new Error(`Resend responded ${res.status} for ${to}${detail ? `: ${detail}` : ""}`);
}

// One request per recipient. Without a verified domain Resend refuses to send to
// anyone but the account owner, and if that were one request for several
// recipients the refusal of one address would block them all. Sent separately,
// each address that IS allowed still gets its email.
async function sendViaResend({ subject, text, replyTo }) {
  const recipients = smtp.notifyTo;

  const results = await Promise.allSettled(
    recipients.map(async (to) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${emailConfig.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: displayFrom(emailConfig.from),
          to: [to],
          subject,
          text,
          reply_to: replyTo,
        }),
        signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
      });
      if (!res.ok) throw await resendFailure(to, res);
    })
  );

  const failed = results
    .map((result, i) => (result.status === "rejected" ? { to: recipients[i], reason: result.reason.message } : null))
    .filter(Boolean);

  if (failed.length === recipients.length) {
    throw new Error(`Resend delivered to no one. ${failed.map((f) => f.reason).join("; ")}`);
  }
  failed.forEach((f) => {
    // eslint-disable-next-line no-console
    console.error(`[email] Resend could not deliver to ${f.to}: ${f.reason}`);
  });
  return failed.length ? { sent: true, failed: failed.map((f) => f.to) } : { sent: true };
}

// Send one notification with whichever provider is configured. SMTP wins when it is
// fully set up: it takes three deliberate values rather than one, and it delivers to
// every recipient. Resend's free sender only reaches the Resend account owner, so a
// leftover RESEND_API_KEY must not quietly override a working SMTP setup — that trap
// is exactly what kept the live notification emails from arriving.
// `what` only names the email in the log.
async function deliver(message, what) {
  const mailer = getTransporter();
  if (mailer) {
    await mailer.sendMail({
      from: `"NeovationLabs" <${smtp.user}>`,
      to: smtp.notifyTo,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
    });
    return { sent: true };
  }

  if (emailConfig.resendApiKey) return sendViaResend(message);

  // eslint-disable-next-line no-console
  console.warn(`[email] Email is not configured (set SMTP_*, or RESEND_API_KEY) — skipping ${what}.`);
  return { sent: false, reason: "email-not-configured" };
}

async function sendContactNotification(submission) {
  const { name, company, email, phone, projectType, message } = submission;

  return deliver(
    {
      replyTo: email,
      subject: `New project request — ${projectType} (${name})`,
      text: [
        `Name: ${name}`,
        `Company: ${company || "—"}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Project type: ${projectType}`,
        "",
        message,
      ].join("\n"),
    },
    "notification email"
  );
}

// Demo titles for the notification email, so the team doesn't have to read
// slugs. Keys match demoSlugs in validators/demoBookingValidator.js.
const demoTitles = {
  "cross-camera-face-search": "Cross-Camera Face Search",
  "retail-footfall-heatmap": "Retail Footfall Heatmap",
  "offline-document-qa": "DocQuery — Offline Document Q&A",
};

async function sendDemoBookingNotification(booking) {
  const {
    name,
    company,
    email,
    phone,
    demos,
    preferredDate,
    preferredTime,
    timezone,
    attendees,
    notes,
  } = booking;

  const wanted = (demos || []).map((slug) => demoTitles[slug] || slug);

  return deliver(
    {
      replyTo: email,
      subject: `Live demo request — ${preferredDate} ${preferredTime} ${timezone} (${name})`,
      text: [
        `Name: ${name}`,
        `Company: ${company || "—"}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        "",
        `Demos requested: ${wanted.join(", ")}`,
        `Preferred slot: ${preferredDate}, ${preferredTime} (${timezone})`,
        `Attendees: ${attendees || 1}`,
        "",
        "Notes:",
        notes || "—",
        "",
        `Send a Google Meet invite to ${email} to confirm.`,
      ].join("\n"),
    },
    "demo booking email"
  );
}

// Whether email is set up on this server and which way it sends, for the health page.
// Safe to show publicly: no key, no password, no recipient addresses (only how many).
function emailStatus() {
  const recipientCount = smtp.notifyTo.length;

  // Same order as deliver(): SMTP first.
  if (smtp.host && smtp.user && smtp.password) {
    return {
      configured: true,
      provider: "smtp",
      recipientCount,
      ...(emailConfig.resendApiKey
        ? { note: "RESEND_API_KEY is also set but is ignored; SMTP takes priority." }
        : {}),
    };
  }

  if (emailConfig.resendApiKey) {
    const testSender = /@resend\.dev>?$/i.test(emailConfig.from);
    return {
      configured: true,
      provider: "resend",
      from: emailConfig.from,
      recipientCount,
      ...(testSender
        ? {
            warning:
              "This is Resend's free test sender. Resend only delivers to the email address the Resend account was created with, so other recipients are refused. Verify a domain in Resend and set EMAIL_FROM to an address on it, or use SMTP (and remove RESEND_API_KEY), to reach every recipient.",
          }
        : {}),
    };
  }
  return {
    configured: false,
    provider: null,
    recipientCount,
    hint: "No email service is set up on this server. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD (or RESEND_API_KEY) in the server's environment variables for Production, then redeploy.",
  };
}

module.exports = { sendContactNotification, sendDemoBookingNotification, emailStatus };
