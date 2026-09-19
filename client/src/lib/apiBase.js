// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/

// Where the API lives. Trailing slashes and stray spaces are stripped: requests are
// built as `${API_BASE}/api/...`, so a value like "https://api.example.com/" would
// become "https://api.example.com//api/..." and hosts such as Vercel answer a
// double slash with a redirect, which browsers refuse on a preflight request. That
// silently broke the live contact form.
export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .trim()
  .replace(/\/+$/, "");
