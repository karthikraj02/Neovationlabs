// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const { z } = require("zod");

// Slugs must match client/src/data/demos.js — a booking can only reference a
// demo that actually exists on the site.
const demoSlugs = [
  "cross-camera-face-search",
  "retail-footfall-heatmap",
  "offline-document-qa",
];

const timeWindows = [
  "09:00 – 11:00",
  "11:00 – 13:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];

// YYYY-MM-DD, as produced by <input type="date">.
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const demoBookingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  demos: z
    .array(z.enum(demoSlugs, { errorMap: () => ({ message: "Unknown demo" }) }))
    .min(1, "Select at least one demo")
    .max(demoSlugs.length),
  preferredDate: z
    .string()
    .trim()
    .regex(isoDate, "Choose a date")
    .refine((value) => {
      const chosen = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(chosen.getTime())) return false;
      const today = new Date();
      const todayUtc = Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      );
      return chosen.getTime() >= todayUtc;
    }, "Choose a date that hasn't already passed"),
  preferredTime: z.enum(timeWindows, {
    errorMap: () => ({ message: "Select a time window" }),
  }),
  timezone: z.string().trim().min(1, "Enter your timezone").max(60),
  attendees: z.coerce.number().int().min(1).max(50).optional().default(1),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  // Honeypot — must arrive empty, same approach as the contact form.
  website: z.string().max(0).optional().or(z.literal("")),
});

module.exports = { demoBookingSchema, demoSlugs, timeWindows };
