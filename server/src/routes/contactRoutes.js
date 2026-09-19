// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const { submitContact } = require("../controllers/contactController");
const { validateBody } = require("../middleware/validateBody");
const { contactSchema } = require("../validators/contactValidator");
const { contactLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", contactLimiter, validateBody(contactSchema), submitContact);

module.exports = router;
