const express = require("express");
const { recordPageView } = require("../controllers/analyticsController");
const { validateBody } = require("../middleware/validateBody");
const { pageViewSchema } = require("../validators/analyticsValidator");

const router = express.Router();

router.post("/pageview", validateBody(pageViewSchema), recordPageView);

module.exports = router;
