
const { generateAIResponse } = require("../services/groqService");

const testAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters.",
      });
    }

    const aiResponse = await generateAIResponse(message.trim());

    return res.status(200).json({
      success: true,
      message: "Groq AI is working successfully!",
      data: {
        userMessage: message.trim(),
        aiResponse,
      },
    });
  } catch (error) {
    console.error("ImpactLink AI Error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to get a response from ImpactLink AI.",
      error: error.message,
    });
  }
};

module.exports = { testAI };
