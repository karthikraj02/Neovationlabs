// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/

/**
 * A visitor's IP address in one predictable form, or "" if it doesn't look like one.
 * Express's `req.ip` can carry an IPv4-mapped IPv6 prefix ("::ffff:203.0.113.7"), which
 * would make one person look like two, and anything that is not plain address characters
 * is refused so junk never ends up stored or used in a database query.
 */
function cleanIp(raw) {
  const ip = String(raw || "")
    .trim()
    .replace(/^::ffff:/i, "")
    .toLowerCase();
  if (!/^[0-9a-f:.]{2,45}$/.test(ip)) return "";
  if (!ip.includes(".") && !ip.includes(":")) return "";
  return ip;
}

module.exports = { cleanIp };
