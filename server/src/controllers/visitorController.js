// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const VisitLog = require("../models/VisitLog");
const { cleanIp } = require("../lib/ip");
const { ApiError } = require("../middleware/errorHandler");

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGES = [7, 30, 90];
const DETAIL_LIMIT = 500;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// All visitors in the chosen period, one row per IP address, most recent first.
//   visits    = separate browsing sessions from that address
//   pageViews = every page they opened
//   devices   = different browsers/devices seen on that address (a shared office or
//               mobile network shows several, so an IP is not always one person)
async function listVisitors(req, res, next) {
  try {
    const days = RANGES.includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

    const match = { createdAt: { $gte: new Date(Date.now() - days * DAY_MS) } };
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase().slice(0, 45) : "";
    if (q) match.ip = new RegExp(`^${escapeRegex(q)}`);

    const [result] = await VisitLog.aggregate([
      { $match: match },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$ip",
          pageViews: { $sum: 1 },
          sessions: { $addToSet: "$sessionId" },
          devices: { $addToSet: "$visitorId" },
          firstSeen: { $min: "$createdAt" },
          lastSeen: { $max: "$createdAt" },
          country: { $last: "$country" },
          device: { $last: "$device" },
          lastPath: { $last: "$path" },
        },
      },
      {
        $project: {
          _id: 0,
          ip: "$_id",
          pageViews: 1,
          visits: { $size: "$sessions" },
          devices: { $size: "$devices" },
          firstSeen: 1,
          lastSeen: 1,
          country: 1,
          device: 1,
          lastPath: 1,
        },
      },
      { $sort: { lastSeen: -1 } },
      { $facet: { rows: [{ $skip: (page - 1) * limit }, { $limit: limit }], total: [{ $count: "n" }] } },
    ]);

    const total = result?.total?.[0]?.n ?? 0;
    return res.json({
      success: true,
      data: result?.rows ?? [],
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      range: { days },
    });
  } catch (err) {
    return next(new ApiError(500, "Could not load visitors.", err.message));
  }
}

// One address's history: each visit (session) with when it started and which pages
// were opened at what time.
async function getVisitorDetail(req, res, next) {
  const ip = cleanIp(req.query.ip);
  if (!ip) return next(new ApiError(400, "A valid IP address is required."));

  try {
    const logs = await VisitLog.find({ ip })
      .sort({ createdAt: -1 })
      .limit(DETAIL_LIMIT + 1)
      .select("sessionId visitorId path referrer device country createdAt")
      .lean();

    const truncated = logs.length > DETAIL_LIMIT;
    const rows = logs.slice(0, DETAIL_LIMIT);

    const sessions = new Map();
    const devices = new Set();
    for (const row of rows) {
      devices.add(row.visitorId);
      let visit = sessions.get(row.sessionId);
      if (!visit) {
        visit = { sessionId: row.sessionId, startedAt: row.createdAt, endedAt: row.createdAt, device: row.device, country: row.country, referrer: "", pages: [] };
        sessions.set(row.sessionId, visit);
      }
      if (row.createdAt < visit.startedAt) visit.startedAt = row.createdAt;
      if (row.createdAt > visit.endedAt) visit.endedAt = row.createdAt;
      if (row.referrer) visit.referrer = row.referrer;
      visit.pages.push({ path: row.path, at: row.createdAt });
    }

    const visits = [...sessions.values()]
      .map((v) => ({ ...v, pages: v.pages.sort((a, b) => new Date(a.at) - new Date(b.at)) }))
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    return res.json({
      success: true,
      data: {
        ip,
        totals: { pageViews: rows.length, visits: visits.length, devices: devices.size },
        visits,
        truncated,
      },
    });
  } catch (err) {
    return next(new ApiError(500, "Could not load this visitor.", err.message));
  }
}

// Erase every stored visit record for one IP address (for example, a deletion request).
async function deleteVisitor(req, res, next) {
  const ip = cleanIp(req.query.ip);
  if (!ip) return next(new ApiError(400, "A valid IP address is required."));

  try {
    const result = await VisitLog.deleteMany({ ip });
    return res.json({ success: true, deleted: result.deletedCount ?? 0 });
  } catch (err) {
    return next(new ApiError(500, "Could not delete these records.", err.message));
  }
}

module.exports = { listVisitors, getVisitorDetail, deleteVisitor };
