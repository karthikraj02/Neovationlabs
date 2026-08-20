const Service = require("../models/Service");
const Insight = require("../models/Insight");

async function listServices(req, res, next) {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

async function getService(req, res, next) {
  try {
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

async function listInsights(req, res, next) {
  try {
    const insights = await Insight.find().sort({ publishedAt: -1 });
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
}

async function getInsight(req, res, next) {
  try {
    const insight = await Insight.findOne({ slug: req.params.slug });
    if (!insight) {
      return res.status(404).json({ success: false, message: "Insight not found." });
    }
    res.json({ success: true, data: insight });
  } catch (err) {
    next(err);
  }
}

module.exports = { listServices, getService, listInsights, getInsight };
