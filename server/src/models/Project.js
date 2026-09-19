// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const mongoose = require("mongoose");
const { projectStatuses, projectPriorities } = require("../validators/adminValidator");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  dueDate: { type: Date, default: null },
  done: { type: Boolean, default: false },
});

const updateSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  author: { type: String, trim: true, maxlength: 120, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    client: { type: String, required: true, trim: true, maxlength: 160 },
    clientEmail: { type: String, trim: true, lowercase: true, maxlength: 200, default: "" },
    status: { type: String, enum: projectStatuses, default: "planning" },
    priority: { type: String, enum: projectPriorities, default: "medium" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    budget: { type: String, trim: true, maxlength: 60, default: "" },
    description: { type: String, trim: true, maxlength: 4000, default: "" },
    techStack: { type: [String], default: [] },
    team: { type: [String], default: [] },
    milestones: { type: [milestoneSchema], default: [] },
    // Newest first — progress notes the team posts as the project moves.
    updates: { type: [updateSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
