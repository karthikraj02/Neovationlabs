// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-hs256-signing";

// dotenv never overrides a variable that is already set, so blanking these here
// means credentials in a developer's real .env can never leak into a test run and
// cause a real email or WhatsApp message to be sent.
[
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "CONTACT_NOTIFY_EMAIL",
  "CALLMEBOT_API_KEY",
  "WHATSAPP_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_TEMPLATE",
].forEach((key) => {
  process.env[key] = "";
});

// Second safety net: even if a real credential somehow got through, a test must
// never reach a real messaging service. Any such call fails loudly instead of
// sending. Tests that need `fetch` replace it with a mock, which is unaffected.
const MESSAGING_HOSTS = /api\.resend\.com|api\.callmebot\.com|graph\.facebook\.com/;
const realFetch = global.fetch;
global.fetch = (input, init) => {
  const url = String((input && input.url) || input);
  if (MESSAGING_HOSTS.test(url)) {
    throw new Error(`A test tried to call a real messaging API (${url.split("?")[0]}). Mock fetch instead.`);
  }
  return realFetch(input, init);
};
