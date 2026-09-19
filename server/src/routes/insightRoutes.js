// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const { listInsights, getInsight } = require("../controllers/contentController");

const router = express.Router();

router.get("/", listInsights);
router.get("/:slug", getInsight);

module.exports = router;
