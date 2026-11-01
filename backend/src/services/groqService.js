
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function generateAIResponse(message, customSystemPrompt = null) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from backend environment.");
  }

  const systemPrompt =
    customSystemPrompt ||
    "You are ImpactLink AI, a helpful assistant for a community campaign and volunteer coordination platform. Give clear, friendly and concise answers. Do not invent platform features.";

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
    signal: AbortSignal.timeout(30000),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message || "Groq API request failed.";

    throw new Error(errorMessage);
  }

  const aiMessage = data?.choices?.[0]?.message?.content;

  if (!aiMessage) {
    throw new Error("Groq returned an empty response.");
  }

  return aiMessage;
}

module.exports = { generateAIResponse };
