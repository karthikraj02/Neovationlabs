// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const { z } = require("zod");

// Random ids generated in the browser (crypto.randomUUID or a fallback).
const clientId = z.string().regex(/^[A-Za-z0-9-]{8,64}$/, "Invalid id");

const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(300).regex(/^\//, "Path must start with /"),
  visitorId: clientId,
  sessionId: clientId,
  referrer: z.string().max(2000).optional().or(z.literal("")),
});

module.exports = { pageViewSchema };
