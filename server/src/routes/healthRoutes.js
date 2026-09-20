// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const { connectDB, getDbStatus } = require("../config/db");
const { emailStatus } = require("../services/emailService");
const { whatsappStatus } = require("../services/whatsappService");

const router = express.Router();

// `status` says the server itself is running. `notifications` says whether email and
// WhatsApp alerts are set up (never any keys or addresses). `database` says whether it is connected
// to MongoDB and, if not, why, in plain words with no secrets in it. Add ?db=1 to make
// a live connection attempt first, so the answer is current instead of the last known
// state (it can take up to about 8 seconds if the database cannot be reached).
router.get("/", async (req, res) => {
  if (req.query.db) {
    try {
      await connectDB();
    } catch {
      // the reason is reported in `database` below
    }
  }
  res.json({
    status: "ok",
    service: "neovationlabs-api",
    database: getDbStatus(),
    notifications: { email: emailStatus(), whatsapp: whatsappStatus() },
  });
});

module.exports = router;
