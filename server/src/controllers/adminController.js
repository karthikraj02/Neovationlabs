const ContactSubmission = require("../models/ContactSubmission");
const DemoBooking = require("../models/DemoBooking");
const PageView = require("../models/PageView");
const Project = require("../models/Project");
const { analyticsTimezone } = require("../config/env");
const { ApiError } = require("../middleware/errorHandler");
const { enquiryStatuses, demoBookingStatuses } = require("../validators/adminValidator");

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGES = [7, 30, 90];
const ACTIVE_PROJECT_STATUSES = ["planning", "in-progress", "review"];

function dayKey(date) {
  // en-CA formats as YYYY-MM-DD, matching Mongo's $dateToString below.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: analyticsTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const countBy = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));
const firstCount = (rows) => rows[0]?.n ?? 0;
const sum = (values) => values.reduce((a, b) => a + b, 0);

async function getStats(req, res, next) {
  const days = RANGES.includes(Number(req.query.days)) ? Number(req.query.days) : 30;
  const now = new Date();
  const since = new Date(now.getTime() - days * DAY_MS);
  const inRange = { createdAt: { $gte: since } };

  try {
    const [
      daily,
      visitors,
      sessions,
      topPages,
      referrers,
      devices,
      enquiryStatus,
      enquiriesInRange,
      bookingStatus,
      bookingsInRange,
      projectStatus,
      activeProjects,
      recentEnquiries,
      recentBookings,
    ] = await Promise.all([
      PageView.aggregate([
        { $match: inRange },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: analyticsTimezone } },
              visitor: "$visitorId",
            },
            views: { $sum: 1 },
          },
        },
        { $group: { _id: "$_id.day", visitors: { $sum: 1 }, views: { $sum: "$views" } } },
      ]),
      PageView.aggregate([{ $match: inRange }, { $group: { _id: "$visitorId" } }, { $count: "n" }]),
      PageView.aggregate([{ $match: inRange }, { $group: { _id: "$sessionId" } }, { $count: "n" }]),
      PageView.aggregate([
        { $match: inRange },
        { $group: { _id: "$path", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
        { $project: { _id: 0, path: "$_id", views: 1, visitors: { $size: "$visitors" } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
      ]),
      PageView.aggregate([
        { $match: { ...inRange, referrer: { $ne: "" } } },
        { $group: { _id: "$referrer", views: { $sum: 1 } } },
        { $project: { _id: 0, source: "$_id", views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 6 },
      ]),
      PageView.aggregate([{ $match: inRange }, { $group: { _id: "$device", count: { $sum: 1 } } }]),
      ContactSubmission.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ContactSubmission.countDocuments(inRange),
      DemoBooking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      DemoBooking.countDocuments(inRange),
      Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Project.find({ status: { $in: ACTIVE_PROJECT_STATUSES } })
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("name client status progress dueDate")
        .lean(),
      ContactSubmission.find().sort({ createdAt: -1 }).limit(5).select("name company projectType status createdAt").lean(),
      DemoBooking.find().sort({ createdAt: -1 }).limit(5).select("name company demos preferredDate status createdAt").lean(),
    ]);

    // Fill every day in the window, including days with no traffic.
    const byDay = new Map(daily.map((d) => [d._id, d]));
    const series = Array.from({ length: days }, (_, i) => {
      const date = dayKey(new Date(now.getTime() - (days - 1 - i) * DAY_MS));
      const row = byDay.get(date);
      return { date, visitors: row?.visitors ?? 0, views: row?.views ?? 0 };
    });

    const enquiriesByStatus = countBy(enquiryStatus);
    const bookingsByStatus = countBy(bookingStatus);
    const projectsByStatus = countBy(projectStatus);

    return res.json({
      success: true,
      data: {
        range: { days, timezone: analyticsTimezone },
        traffic: {
          visitors: firstCount(visitors),
          sessions: firstCount(sessions),
          pageViews: sum(daily.map((d) => d.views)),
          today: series[series.length - 1].visitors,
          daily: series,
          topPages,
          referrers,
          devices: countBy(devices),
        },
        enquiries: {
          total: sum(Object.values(enquiriesByStatus)),
          inRange: enquiriesInRange,
          byStatus: enquiriesByStatus,
          recent: recentEnquiries,
        },
        demoBookings: {
          total: sum(Object.values(bookingsByStatus)),
          inRange: bookingsInRange,
          byStatus: bookingsByStatus,
          recent: recentBookings,
        },
        projects: {
          total: sum(Object.values(projectsByStatus)),
          active: sum(ACTIVE_PROJECT_STATUSES.map((s) => projectsByStatus[s] || 0)),
          byStatus: projectsByStatus,
          activeList: activeProjects,
        },
      },
    });
  } catch (err) {
    return next(new ApiError(500, "Could not load dashboard stats.", err.message));
  }
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function listHandler(Model, statuses) {
  return async (req, res, next) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};
    if (typeof req.query.status === "string" && statuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (typeof req.query.q === "string" && req.query.q.trim()) {
      const rx = new RegExp(escapeRegex(req.query.q.trim().slice(0, 100)), "i");
      filter.$or = [{ name: rx }, { company: rx }, { email: rx }];
    }

    try {
      const [items, total] = await Promise.all([
        Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Model.countDocuments(filter),
      ]);
      return res.json({ success: true, data: items, page, pages: Math.max(1, Math.ceil(total / limit)), total });
    } catch (err) {
      return next(new ApiError(500, "Could not load records.", err.message));
    }
  };
}

function updateHandler(Model, label) {
  return async (req, res, next) => {
    const changes = Object.fromEntries(Object.entries(req.validatedBody).filter(([, v]) => v !== undefined));
    try {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: changes },
        { returnDocument: "after", runValidators: true }
      ).lean();
      if (!doc) return next(new ApiError(404, `${label} not found.`));
      return res.json({ success: true, data: doc });
    } catch (err) {
      return next(new ApiError(500, `Could not update ${label.toLowerCase()}.`, err.message));
    }
  };
}

module.exports = {
  getStats,
  listEnquiries: listHandler(ContactSubmission, enquiryStatuses),
  updateEnquiry: updateHandler(ContactSubmission, "Enquiry"),
  listDemoBookings: listHandler(DemoBooking, demoBookingStatuses),
  updateDemoBooking: updateHandler(DemoBooking, "Demo booking"),
};
