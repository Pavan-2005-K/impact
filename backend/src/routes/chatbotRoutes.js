
const express = require("express");

const { sendChatbotMessage } = require("../controllers/chatbotController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// All authenticated roles can use the chatbot.
// Data access is restricted inside chatbotContextService.
router.post(
    "/message",
    authenticateToken,
    sendChatbotMessage
);

module.exports = router;
