// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/

// Vercel adds the visitor's approximate location to every request as headers:
//   x-vercel-ip-country          "IN"
//   x-vercel-ip-country-region   "KA"
//   x-vercel-ip-city             "Bengaluru", URL-encoded ("S%C3%A3o%20Paulo")
// The values come from a lookup of the visitor's IP address, so they are approximate:
// usually right to the city, but a VPN, a mobile network, or an office can put someone
// in a different city or country from where they really are. Nothing here is a
// precise location, and no coordinates are stored.

const MAX_CITY = 100;
const MAX_REGION = 10;

// Drops control characters (character codes 0-31 and 127) and angle brackets. Written
// with character codes rather than a regex so the file holds no invisible characters.
function stripUnsafe(text) {
  return Array.from(text)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code > 31 && code !== 127 && ch !== "<" && ch !== ">";
    })
    .join("");
}

function cleanCity(raw) {
  let value = String(raw || "");
  try {
    value = decodeURIComponent(value);
  } catch {
    // not valid URL-encoding; use it as it came
  }
  // Header values are outside data: drop control characters and angle brackets, then cap the length.
  return stripUnsafe(value).trim().slice(0, MAX_CITY);
}

function cleanRegion(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, MAX_REGION);
}

function cleanCountry(raw) {
  const code = String(raw || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "";
}

/** The visitor's approximate place, read from Vercel's request headers. Empty strings when unknown. */
function locationFrom(req) {
  return {
    country: cleanCountry(req.get("x-vercel-ip-country")),
    region: cleanRegion(req.get("x-vercel-ip-country-region")),
    city: cleanCity(req.get("x-vercel-ip-city")),
  };
}

module.exports = { locationFrom, cleanCity, cleanRegion, cleanCountry };
