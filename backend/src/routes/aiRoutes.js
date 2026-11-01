
const express = require("express");
const router = express.Router();

const { testAI } = require("../controllers/aiController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protected AI test endpoint
router.post("/test", authenticateToken, testAI);

module.exports = router;
