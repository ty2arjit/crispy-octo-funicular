const { generateWithGroq } = require("./groqService");
const { synthesizeSpeech } = require("./hfService");

async function generateAssistantReply({ messages = [], user }) {
  const history = (messages || [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .slice(-10)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const systemPrompt = [
    "You are Squirrel, a current-affairs mentor for Indian learners and UPSC aspirants.",
    "Keep answers concise, factual, and exam-oriented when relevant.",
    "If asked for revision, provide bullets with key facts, background, and likely exam angle.",
    "Do not fabricate specific numbers when uncertain."
  ].join(" ");

  const userPrompt = [
    `User role: ${user?.role || "student"}`,
    `User interests: ${(user?.interests || []).join(", ") || "general current affairs"}`,
    "Conversation:",
    history || "USER: Hello"
  ].join("\n");

  const reply = await generateWithGroq(systemPrompt, userPrompt);

  if (reply) {
    return reply;
  }

  return "I am ready to help with current affairs. Ask about economy, polity, international relations, science, or quiz prep and I will break it down for UPSC-style understanding.";
}

async function createNarration(text) {
  const audioDataUri = await synthesizeSpeech(text);

  return {
    audioDataUri,
    fallbackText: text
  };
}

module.exports = {
  generateAssistantReply,
  createNarration
};
