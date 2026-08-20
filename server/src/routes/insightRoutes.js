const express = require("express");
const { listInsights, getInsight } = require("../controllers/contentController");

const router = express.Router();

router.get("/", listInsights);
router.get("/:slug", getInsight);

module.exports = router;
