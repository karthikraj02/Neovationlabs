// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const PageView = require("../models/PageView");
const VisitLog = require("../models/VisitLog");
const { cleanIp } = require("../lib/ip");
const { clientUrl } = require("../config/env");
const { ApiError } = require("../middleware/errorHandler");

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor/i;

function deviceFrom(ua) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const ownHost = hostname(clientUrl);

async function recordPageView(req, res, next) {
  const ua = req.get("user-agent") || "";
  if (!ua || BOT_UA.test(ua)) return res.status(204).end();

  const { path, visitorId, sessionId, referrer } = req.validatedBody;
  const source = hostname(referrer || "");

  const view = {
    path: path.split(/[?#]/)[0],
    visitorId,
    sessionId,
    referrer: source === ownHost ? "" : source,
    device: deviceFrom(ua),
    // Set by Vercel's edge; empty when running elsewhere.
    country: (req.get("x-vercel-ip-country") || "").slice(0, 2).toUpperCase(),
  };
  const ip = cleanIp(req.ip);

  try {
    await Promise.all([
      // The anonymous view: no IP, kept ~13 months.
      PageView.create(view),
      // The same view with the IP, for the admin's Visitors page: kept 90 days. Failing to
      // record it must never lose the anonymous view, so it is handled on its own.
      ip
        ? VisitLog.create({ ...view, ip }).catch((err) => {
            // eslint-disable-next-line no-console
            console.error("[visitors] Could not record visit:", err.message);
          })
        : null,
    ]);
    return res.status(204).end();
  } catch (err) {
    return next(new ApiError(500, "Could not record page view.", err.message));
  }
}

module.exports = { recordPageView };
