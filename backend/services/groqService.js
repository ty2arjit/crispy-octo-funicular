const axios = require("axios");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function generateWithGroq(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    return response.data.choices?.[0]?.message?.content || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateWithGroq
};
