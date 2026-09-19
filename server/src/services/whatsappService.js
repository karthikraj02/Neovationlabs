// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const { whatsapp } = require("../config/env");

const REQUEST_TIMEOUT_MS = 8000;
const MAX_MESSAGE_CHARS = 700; // keeps the alert readable and well inside WhatsApp's limits

/** Which sender is configured: Meta's official Cloud API, CallMeBot, or none. */
function activeProvider() {
  if (whatsapp.cloud.token && whatsapp.cloud.phoneNumberId) return "cloud";
  if (whatsapp.callmebot.apiKey) return "callmebot";
  return null;
}

const clip = (text, max) => {
  const value = String(text || "").trim();
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
};

/** The alert as a readable multi-line WhatsApp message. */
function contactMessage(submission) {
  const { name, company, email, phone, projectType, message } = submission;
  return [
    `New project request — ${projectType}`,
    "",
    `Name: ${name}`,
    company ? `Company: ${company}` : null,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    "",
    clip(message, MAX_MESSAGE_CHARS),
  ]
    .filter((line) => line !== null)
    .join("\n");
}

// WhatsApp template parameters must be a single line: no newlines or tabs, and
// no runs of 4+ spaces. So the same alert is flattened for the template path.
function oneLine(text) {
  return String(text).replace(/[\r\n\t]+/g, " | ").replace(/ {2,}/g, " ").trim();
}

// Errors carry the status and a short reply from the provider, never the URL or
// credentials (CallMeBot puts its key in the URL).
async function failure(provider, res) {
  let detail = "";
  try {
    detail = (await res.text()).replace(/\s+/g, " ").slice(0, 200);
  } catch {
    // ignore body read errors
  }
  return new Error(`WhatsApp (${provider}) responded ${res.status}${detail ? `: ${detail}` : ""}`);
}

async function sendViaCloud(text) {
  const { token, phoneNumberId, template, templateLanguage, apiVersion } = whatsapp.cloud;

  const payload = template
    ? {
        messaging_product: "whatsapp",
        to: whatsapp.to,
        type: "template",
        template: {
          name: template,
          language: { code: templateLanguage },
          components: [{ type: "body", parameters: [{ type: "text", text: oneLine(text) }] }],
        },
      }
    : {
        // Plain text is only delivered inside WhatsApp's 24-hour reply window.
        // For alerts that arrive at any time, configure WHATSAPP_TEMPLATE.
        messaging_product: "whatsapp",
        to: whatsapp.to,
        type: "text",
        text: { body: text },
      };

  const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw await failure("cloud", res);
}

async function sendViaCallMeBot(text) {
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", `+${whatsapp.to}`);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", whatsapp.callmebot.apiKey);

  const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!res.ok) throw await failure("callmebot", res);
}

/**
 * Send one WhatsApp alert to the company number.
 * Resolves { sent: true, provider } on success, or { sent: false, reason } when no
 * provider is configured. Rejects if the provider fails, so the caller can log it.
 */
async function sendWhatsAppAlert(text) {
  const provider = activeProvider();
  if (!provider) {
    // eslint-disable-next-line no-console
    console.warn("[whatsapp] Not configured — skipping WhatsApp alert.");
    return { sent: false, reason: "whatsapp-not-configured" };
  }
  if (provider === "cloud") await sendViaCloud(text);
  else await sendViaCallMeBot(text);
  return { sent: true, provider };
}

/** WhatsApp alert for a new project request from the contact form. */
async function sendContactWhatsApp(submission) {
  return sendWhatsAppAlert(contactMessage(submission));
}

module.exports = { sendContactWhatsApp, sendWhatsAppAlert, contactMessage, activeProvider };
