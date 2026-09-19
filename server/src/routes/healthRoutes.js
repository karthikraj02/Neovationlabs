// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "neovationlabs-api" });
});

module.exports = router;
