// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("./middleware/sanitizeBody");

const { clientOrigins, nodeEnv } = require("./config/env");
const { generalLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/healthRoutes");
const contactRoutes = require("./routes/contactRoutes");
const demoBookingRoutes = require("./routes/demoBookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const insightRoutes = require("./routes/insightRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(mongoSanitize.sanitizeBody);

if (nodeEnv !== "test") {
  app.use(morgan(nodeEnv === "production" ? "combined" : "dev"));
}

app.use(generalLimiter);

app.use("/api/health", healthRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/demo-bookings", demoBookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
