// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const app = require("../src/app");
const { connectDB } = require("../src/config/db");

// Establish database connection on warm start for serverless environment
connectDB().catch((err) => {
  console.error("[serverless] Database connection failed:", err.message);
});

// Export the Express app for Vercel's Node.js builder
module.exports = app;
