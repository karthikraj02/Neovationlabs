const express = require("express");
const { submitContact } = require("../controllers/contactController");
const { validateBody } = require("../middleware/validateBody");
const { contactSchema } = require("../validators/contactValidator");
const { contactLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", contactLimiter, validateBody(contactSchema), submitContact);

module.exports = router;
