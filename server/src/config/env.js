require("dotenv").config();

const required = ["MONGODB_URI"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length && process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line no-console
  console.warn(
    `[config] Missing environment variables: ${missing.join(", ")}. See .env.example.`
  );
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    notifyTo: process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER || "",
  },
};
