const nodemailer = require("nodemailer");
const { smtp } = require("../config/env");

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

async function sendContactNotification(submission) {
  const mailer = getTransporter();
  if (!mailer) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP not configured — skipping notification email.");
    return { sent: false, reason: "smtp-not-configured" };
  }

  const { name, company, email, projectType, budget, message } = submission;

  await mailer.sendMail({
    from: `"NeovationLabs" <${smtp.user}>`,
    to: smtp.notifyTo,
    replyTo: email,
    subject: `New project request — ${projectType} (${name})`,
    text: [
      `Name: ${name}`,
      `Company: ${company || "—"}`,
      `Email: ${email}`,
      `Project type: ${projectType}`,
      `Budget: ${budget}`,
      "",
      message,
    ].join("\n"),
  });

  return { sent: true };
}

// Demo titles for the notification email, so the team doesn't have to read
// slugs. Keys match demoSlugs in validators/demoBookingValidator.js.
const demoTitles = {
  "cross-camera-face-search": "Cross-Camera Face Search",
  "retail-footfall-heatmap": "Retail Footfall Heatmap",
  "offline-document-qa": "DocQuery — Offline Document Q&A",
};

async function sendDemoBookingNotification(booking) {
  const mailer = getTransporter();
  if (!mailer) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP not configured — skipping demo booking email.");
    return { sent: false, reason: "smtp-not-configured" };
  }

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

  await mailer.sendMail({
    from: `"NeovationLabs" <${smtp.user}>`,
    to: smtp.notifyTo,
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
  });

  return { sent: true };
}

module.exports = { sendContactNotification, sendDemoBookingNotification };
