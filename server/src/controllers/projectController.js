// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const Project = require("../models/Project");
const { ApiError } = require("../middleware/errorHandler");
const { projectStatuses } = require("../validators/adminValidator");

const defined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

async function listProjects(req, res, next) {
  const filter =
    typeof req.query.status === "string" && projectStatuses.includes(req.query.status)
      ? { status: req.query.status }
      : {};
  try {
    const data = await Project.find(filter).sort({ updatedAt: -1 }).select("-updates").lean();
    return res.json({ success: true, data });
  } catch (err) {
    return next(new ApiError(500, "Could not load projects.", err.message));
  }
}

async function getProject(req, res, next) {
  try {
    const data = await Project.findById(req.params.id).lean();
    if (!data) return next(new ApiError(404, "Project not found."));
    return res.json({ success: true, data });
  } catch (err) {
    return next(new ApiError(500, "Could not load the project.", err.message));
  }
}

async function createProject(req, res, next) {
  try {
    const data = await Project.create(defined(req.validatedBody));
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(new ApiError(500, "Could not create the project.", err.message));
  }
}

async function updateProject(req, res, next) {
  try {
    const data = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: defined(req.validatedBody) },
      { returnDocument: "after", runValidators: true }
    ).lean();
    if (!data) return next(new ApiError(404, "Project not found."));
    return res.json({ success: true, data });
  } catch (err) {
    return next(new ApiError(500, "Could not update the project.", err.message));
  }
}

async function deleteProject(req, res, next) {
  try {
    const data = await Project.findByIdAndDelete(req.params.id).lean();
    if (!data) return next(new ApiError(404, "Project not found."));
    return res.json({ success: true });
  } catch (err) {
    return next(new ApiError(500, "Could not delete the project.", err.message));
  }
}

async function addProjectUpdate(req, res, next) {
  try {
    const data = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          updates: { $each: [{ text: req.validatedBody.text, author: req.admin.name }], $position: 0 },
        },
      },
      { returnDocument: "after", runValidators: true }
    ).lean();
    if (!data) return next(new ApiError(404, "Project not found."));
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(new ApiError(500, "Could not post the update.", err.message));
  }
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject, addProjectUpdate };
