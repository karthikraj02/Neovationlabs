// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const mongoose = require("mongoose");

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 160, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    projectType: {
      type: String,
      required: true,
      enum: [
        "Generative AI",
        "Custom Software",
        "Computer Vision",
        "AI Agents",
        "Data Engineering",
        "MLOps",
        "Predictive Analytics",
        "Networking",
        "Internet of Things",
        "Other",
      ],
    },
    // No longer collected by the form; kept (optional) so older enquiries still show it.
    budget: { type: String, trim: true, maxlength: 60, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ["new", "reviewed", "archived"],
      default: "new",
    },
    ip: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactSubmission", contactSubmissionSchema);
