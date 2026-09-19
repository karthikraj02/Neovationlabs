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

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  // Admin login is disabled until JWT_SECRET is set.
  jwtSecret: process.env.JWT_SECRET || "",
  adminTokenTtl: process.env.ADMIN_TOKEN_TTL || "12h",
  analyticsTimezone: process.env.ANALYTICS_TIMEZONE || "Asia/Kolkata",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    notifyTo: process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER || "",
  },
};
