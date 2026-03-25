const { v4: uuidv4 } = require("uuid");
const { generateWithGroq } = require("./groqService");
const { fetchArticlesByTopic } = require("./rssService");

function fallbackSummary(topic, articles, mode) {
  const lines = articles.slice(0, 4).map((a, idx) => `${idx + 1}. ${a.title}`);
  const heading =
    mode === "detailed"
      ? `Detailed briefing for ${topic}`
      : mode === "daily60"
        ? `60-second briefing for ${topic}`
        : `Short briefing for ${topic}`;

  return `${heading}: ${lines.join(" | ")}`;
}

function buildWhyMatters(role, topic) {
  const roleMap = {
    student: `This helps for exam-oriented awareness and concept clarity in ${topic}.`,
    investor: `This signals trend and risk movement relevant to portfolio decisions in ${topic}.`,
    developer: `This highlights technology and policy shifts that can impact products in ${topic}.`,
    founder: `This can influence market timing, regulation, and fundraising narrative in ${topic}.`
  };

  return roleMap[(role || "").toLowerCase()] || `This affects your decision making in ${topic}.`;
}

function fallbackQuestions(topic) {
  return [
    `What is the single biggest shift in ${topic} today?`,
    `Which stakeholders gain or lose if this trend continues?`,
    `What should you track tomorrow on this topic?`
  ];
}

async function generateBriefing({ topic, user, mode = "short" }) {
  const feed = await fetchArticlesByTopic(topic, 8);
  const articles = feed.items;

  const systemPrompt =
    "You are an expert business editor. Create concise, factual briefings from headlines without hallucinating data.";
  const userPrompt = `User role: ${user.role}\nMode: ${mode}\nTopic: ${feed.topic}\nArticles:\n${articles
    .map((a, idx) => `${idx + 1}. ${a.title} - ${a.summary}`)
    .join("\n")}\n\nReturn JSON with keys: summary, followUpQuestions (array of 3 strings), keyTakeaways (array of 4 strings).`;

  const aiText = await generateWithGroq(systemPrompt, userPrompt);

  let summary = fallbackSummary(feed.topic, articles, mode);
  let followUpQuestions = fallbackQuestions(feed.topic);
  let keyTakeaways = articles.slice(0, 4).map((a) => a.title);

  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      summary = parsed.summary || summary;
      followUpQuestions = parsed.followUpQuestions || followUpQuestions;
      keyTakeaways = parsed.keyTakeaways || keyTakeaways;
    } catch (error) {
      // Keep fallbacks if model output is not valid JSON.
    }
  }

  return {
    id: uuidv4(),
    topic: feed.topic,
    mode,
    summary,
    whyThisMatters: buildWhyMatters(user.role, feed.topic),
    keyTakeaways,
    followUpQuestions,
    articles,
    createdAt: new Date().toISOString()
  };
}

function rankTopicsForUser(user) {
  const graphEntries = Object.entries(user.interestGraph || {});
  if (!graphEntries.length) {
    return user.interests?.length ? user.interests : ["economy", "technology", "markets"];
  }

  return graphEntries.sort((a, b) => b[1] - a[1]).map(([topic]) => topic);
}

module.exports = {
  generateBriefing,
  rankTopicsForUser
};
