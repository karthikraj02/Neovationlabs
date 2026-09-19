// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const mongoose = require("mongoose");

// Anonymous, first-party page views. No IP address or cookie is stored — a
// visitor is a random id the browser generates and keeps in localStorage.
const pageViewSchema = new mongoose.Schema({
  path: { type: String, required: true, trim: true, maxlength: 300 },
  visitorId: { type: String, required: true, maxlength: 64 },
  sessionId: { type: String, required: true, maxlength: 64 },
  // Hostname only (e.g. "google.com"), never the full referring URL.
  referrer: { type: String, default: "", maxlength: 200 },
  device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
  country: { type: String, default: "", maxlength: 2 },
  createdAt: { type: Date, default: Date.now },
});

// Raw views expire after ~13 months so analytics never grows unbounded.
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400 });
pageViewSchema.index({ visitorId: 1, createdAt: 1 });

module.exports = mongoose.model("PageView", pageViewSchema);
