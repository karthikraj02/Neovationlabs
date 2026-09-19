// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const mongoose = require("mongoose");

const { demoSlugs } = require("../validators/demoBookingValidator");

const demoBookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 160, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    demos: {
      type: [{ type: String, enum: demoSlugs }],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Select at least one demo",
      },
    },
    preferredDate: { type: String, required: true, trim: true, maxlength: 10 },
    preferredTime: { type: String, required: true, trim: true, maxlength: 40 },
    timezone: { type: String, required: true, trim: true, maxlength: 60 },
    attendees: { type: Number, min: 1, max: 50, default: 1 },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["requested", "scheduled", "completed", "cancelled"],
      default: "requested",
    },
    // Filled in by the team once the Google Meet invite has gone out.
    meetingLink: { type: String, trim: true, maxlength: 500, default: "" },
    scheduledFor: { type: Date, default: null },
    ip: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoBooking", demoBookingSchema);
