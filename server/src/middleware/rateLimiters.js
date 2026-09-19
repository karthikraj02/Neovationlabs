// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
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

// Failed sign-ins only; a successful login doesn't use up the allowance.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  message: {
    success: false,
    message: "Too many sign-in attempts. Please wait 15 minutes and try again.",
  },
});

module.exports = { contactLimiter, generalLimiter, loginLimiter };
