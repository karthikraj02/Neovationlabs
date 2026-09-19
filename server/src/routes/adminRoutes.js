// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const { login, me } = require("../controllers/adminAuthController");
const {
  getStats,
  listEnquiries,
  updateEnquiry,
  listDemoBookings,
  updateDemoBooking,
} = require("../controllers/adminController");
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectUpdate,
} = require("../controllers/projectController");
const { requireAdmin, validId } = require("../middleware/requireAdmin");
const { validateBody } = require("../middleware/validateBody");
const { loginLimiter } = require("../middleware/rateLimiters");
const {
  loginSchema,
  enquiryUpdateSchema,
  demoBookingUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  projectNoteSchema,
} = require("../validators/adminValidator");

const router = express.Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.post("/auth/login", loginLimiter, validateBody(loginSchema), login);

// Everything below requires a valid admin session.
router.use(requireAdmin);

router.get("/auth/me", me);
router.get("/stats", getStats);

router.get("/enquiries", listEnquiries);
router.patch("/enquiries/:id", validId, validateBody(enquiryUpdateSchema), updateEnquiry);

router.get("/demo-bookings", listDemoBookings);
router.patch("/demo-bookings/:id", validId, validateBody(demoBookingUpdateSchema), updateDemoBooking);

router.get("/projects", listProjects);
router.post("/projects", validateBody(projectCreateSchema), createProject);
router.get("/projects/:id", validId, getProject);
router.patch("/projects/:id", validId, validateBody(projectUpdateSchema), updateProject);
router.delete("/projects/:id", validId, deleteProject);
router.post("/projects/:id/updates", validId, validateBody(projectNoteSchema), addProjectUpdate);

module.exports = router;
