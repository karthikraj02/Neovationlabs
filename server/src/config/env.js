// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
require("dotenv").config();

const required = ["MONGODB_URI"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length && process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line no-console
  console.warn(
    `[config] Missing environment variables: ${missing.join(", ")}. See .env.example.`
  );
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line no-console
  console.warn("[config] JWT_SECRET is shorter than 32 characters — use a long random value.");
}

// Every project request and demo booking is emailed to these inboxes. Addresses
// listed in CONTACT_NOTIFY_EMAIL (comma-separated) are added to them, never
// substituted, so a stale env value can't silently drop one of the two.
const TEAM_INBOXES = ["neovationlabs@outlook.com", "neovationlabs.official@gmail.com"];

function notifyRecipients(extra) {
  const extras = String(extra || "")
    .split(/[,;\s]+/)
    .map((address) => address.trim())
    .filter(Boolean);
  const seen = new Set();
  return [...TEAM_INBOXES, ...extras].filter((address) => {
    const key = address.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Browsers send the site's address with no trailing slash and compare it to the
// CORS header character for character, so "https://site.app/" would never match
// "https://site.app". Slashes and stray spaces are stripped here, and several
// allowed origins can be listed, comma-separated (e.g. production plus a preview).
const clientOrigins = String(process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// WhatsApp alerts. The number that receives them is the company WhatsApp number.
// Two ways to send, picked by whichever credentials are present:
//   - Meta WhatsApp Cloud API (official)  -> WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID
//   - CallMeBot (free, for your own number) -> CALLMEBOT_API_KEY
// With neither, WhatsApp alerts are simply off (email and the admin page still work).
const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "",
  clientUrl: clientOrigins[0] || "http://localhost:5173",
  clientOrigins,
  // Admin login is disabled until JWT_SECRET is set.
  jwtSecret: process.env.JWT_SECRET || "",
  adminTokenTtl: process.env.ADMIN_TOKEN_TTL || "12h",
  analyticsTimezone: process.env.ANALYTICS_TIMEZONE || "Asia/Kolkata",
  whatsapp: {
    to: digitsOnly(process.env.WHATSAPP_TO) || "919901723492",
    cloud: {
      token: process.env.WHATSAPP_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      // A pre-approved message template. Needed for messages to a number that has
      // not messaged the sender in the last 24 hours (which is the normal case).
      template: process.env.WHATSAPP_TEMPLATE || "",
      templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
      apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
    },
    callmebot: {
      apiKey: process.env.CALLMEBOT_API_KEY || "",
    },
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    notifyTo: notifyRecipients(process.env.CONTACT_NOTIFY_EMAIL),
  },
};
