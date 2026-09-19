// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("./middleware/sanitizeBody");

const { clientOrigins, nodeEnv, mongodbUri } = require("./config/env");
const { connectDB } = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiters");
const { ApiError, notFoundHandler, errorHandler } = require("./middleware/errorHandler");

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

// On serverless hosting the database connection is first attempted when the function
// starts. If that one attempt fails (say Atlas had not yet allowed the host), the
// instance used to stay broken for good. Now each request makes sure the connection
// is up, retrying if it is not (several requests at once share one attempt), and
// answers clearly and quickly if it still cannot connect, instead of each request
// waiting out a 10-second buffer and failing. The health page is exempt so it can
// always report. With no MONGODB_URI (local work and the tests) this does nothing.
async function ensureDatabase(req, res, next) {
  if (!mongodbUri || req.path.startsWith("/health")) return next();
  try {
    await connectDB();
    return next();
  } catch {
    return next(new ApiError(503, "We're having trouble reaching our database. Please try again in a moment."));
  }
}

app.use("/api", ensureDatabase);
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
