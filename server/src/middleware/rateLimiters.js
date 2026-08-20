const rateLimit = require("express-rate-limit");

const isTest = process.env.NODE_ENV === "test";

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    success: false,
    message: "Too many requests from this device. Please try again later.",
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

module.exports = { contactLimiter, generalLimiter };
