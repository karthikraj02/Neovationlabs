// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const mongoose = require("mongoose");

// One row per page view, WITH the visitor's IP address, so the admin can see how often
// the same client comes back and when. This is deliberately a separate collection from
// PageView (which stays anonymous) because an IP address is personal data: it has its
// own, much shorter life, and it can be erased on its own without touching the
// anonymous analytics.
const RETENTION_DAYS = 90;

const visitLogSchema = new mongoose.Schema({
  ip: { type: String, required: true, maxlength: 45 },
  visitorId: { type: String, required: true, maxlength: 64 },
  sessionId: { type: String, required: true, maxlength: 64 },
  path: { type: String, required: true, trim: true, maxlength: 300 },
  referrer: { type: String, default: "", maxlength: 200 },
  device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
  country: { type: String, default: "", maxlength: 2 },
  // Approximate place from the IP address (see lib/geo.js). Kept only here, with the IP,
  // and deleted with it after RETENTION_DAYS. The anonymous PageView keeps just the country.
  region: { type: String, default: "", maxlength: 10 },
  city: { type: String, default: "", maxlength: 100 },
  createdAt: { type: Date, default: Date.now },
});

// Rows are deleted automatically after RETENTION_DAYS.
visitLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * RETENTION_DAYS });
visitLogSchema.index({ ip: 1, createdAt: -1 });

module.exports = mongoose.model("VisitLog", visitLogSchema);
