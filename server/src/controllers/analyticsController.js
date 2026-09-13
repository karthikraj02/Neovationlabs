const PageView = require("../models/PageView");
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

  try {
    await PageView.create({
      path: path.split(/[?#]/)[0],
      visitorId,
      sessionId,
      referrer: source === ownHost ? "" : source,
      device: deviceFrom(ua),
      // Set by Vercel's edge; empty when running elsewhere.
      country: (req.get("x-vercel-ip-country") || "").slice(0, 2).toUpperCase(),
    });
    return res.status(204).end();
  } catch (err) {
    return next(new ApiError(500, "Could not record page view.", err.message));
  }
}

module.exports = { recordPageView };
