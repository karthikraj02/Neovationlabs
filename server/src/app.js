const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("./middleware/sanitizeBody");

const { clientUrl, nodeEnv } = require("./config/env");
const { generalLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/healthRoutes");
const contactRoutes = require("./routes/contactRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const insightRoutes = require("./routes/insightRoutes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: clientUrl,
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
app.use("/api/services", serviceRoutes);
app.use("/api/insights", insightRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
