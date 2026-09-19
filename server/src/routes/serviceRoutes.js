// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const { listServices, getService } = require("../controllers/contentController");

const router = express.Router();

router.get("/", listServices);
router.get("/:slug", getService);

module.exports = router;
