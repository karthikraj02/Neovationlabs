const express = require("express");
const { requestDemo } = require("../controllers/demoBookingController");
const { validateBody } = require("../middleware/validateBody");
const { demoBookingSchema } = require("../validators/demoBookingValidator");
const { contactLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", contactLimiter, validateBody(demoBookingSchema), requestDemo);

module.exports = router;
