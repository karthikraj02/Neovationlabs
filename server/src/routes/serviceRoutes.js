const express = require("express");
const { listServices, getService } = require("../controllers/contentController");

const router = express.Router();

router.get("/", listServices);
router.get("/:slug", getService);

module.exports = router;
