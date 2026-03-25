const express = require("express");
const { getUserById, getBriefing, saveQuiz, getQuiz, updateUser, logInteraction } = require("../data/store");
const { generateQuiz, evaluateQuiz } = require("../services/quizService");

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { userId, topic, difficulty = "basic" } = req.body;
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const briefing = getBriefing(userId, topic);
  if (!briefing) {
    return res.status(400).json({ message: "Generate a briefing first for this topic." });
  }

  try {
    const quiz = await generateQuiz({ topic, briefing, difficulty });
    saveQuiz(userId, quiz);

    return res.json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate quiz", error: error.message });
  }
});

router.post("/submit", (req, res) => {
  const { userId, quizId, answers } = req.body;
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const quiz = getQuiz(userId, quizId);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const evaluation = evaluateQuiz(quiz, answers || []);
  const weakTopicBoost = evaluation.score / Math.max(1, evaluation.total) < 0.6 ? 1 : -1;

  const weakTopics = {
    ...(user.weakTopics || {}),
    [quiz.topic]: Math.max(0, (user.weakTopics?.[quiz.topic] || 0) + weakTopicBoost)
  };

  updateUser(userId, { weakTopics });
  logInteraction(userId, {
    type: "quiz-submit",
    topic: quiz.topic,
    score: evaluation.score,
    total: evaluation.total
  });

  return res.json({
    ...evaluation,
    spacedRepetitionHint:
      weakTopicBoost > 0
        ? `Revisit ${quiz.topic} tomorrow with detailed mode.`
        : `Great progress in ${quiz.topic}. Move to a fresh topic next.`
  });
});

module.exports = router;
