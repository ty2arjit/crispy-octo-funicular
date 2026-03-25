const express = require("express");
const { getUserById, logInteraction, saveBriefing, getBriefing } = require("../data/store");
const { generateBriefing, rankTopicsForUser } = require("../services/briefingService");

const router = express.Router();

router.get("/daily", async (req, res) => {
  const { userId } = req.query;
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ranked = rankTopicsForUser(user);
  return res.json({ topics: ranked.slice(0, 6) });
});

router.get("/briefing/:topic", async (req, res) => {
  const { topic } = req.params;
  const { userId, mode = "short" } = req.query;

  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const briefing = await generateBriefing({ topic, user, mode });
    saveBriefing(user.id, briefing.topic, briefing);

    logInteraction(user.id, {
      type: "briefing-view",
      topic: briefing.topic,
      mode
    });

    return res.json(briefing);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate briefing",
      error: error.message
    });
  }
});

router.get("/briefing/:topic/cache", (req, res) => {
  const { topic } = req.params;
  const { userId } = req.query;

  const briefing = getBriefing(userId, topic);
  if (!briefing) {
    return res.status(404).json({ message: "No cached briefing found" });
  }

  return res.json(briefing);
});

module.exports = router;
