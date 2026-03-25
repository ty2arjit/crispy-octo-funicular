const { v4: uuidv4 } = require("uuid");
const { generateWithGroq } = require("./groqService");

function fallbackQuiz(topic) {
  return [
    {
      id: uuidv4(),
      question: `Which statement best explains today's ${topic} trend?`,
      options: [
        "Short-term event with no structural impact",
        "Early signal of a larger policy or market shift",
        "Purely a global issue unrelated to India",
        "Only relevant for one industry"
      ],
      answerIndex: 1
    },
    {
      id: uuidv4(),
      question: `For UPSC preparation, ${topic} news is most relevant to:`,
      options: ["Ethics", "Current Affairs", "Essay only", "Optional only"],
      answerIndex: 1
    }
  ];
}

async function generateQuiz({ topic, briefing, difficulty = "basic" }) {
  const systemPrompt = "Generate objective quiz questions from current affairs briefing.";
  const userPrompt = `Topic: ${topic}\nDifficulty: ${difficulty}\nSummary: ${briefing.summary}\nKey takeaways: ${briefing.keyTakeaways.join(
    " | "
  )}\n\nReturn JSON array with 5 MCQs. Each item must include question, options (4), answerIndex (0-3).`;

  const aiText = await generateWithGroq(systemPrompt, userPrompt);

  let questions = fallbackQuiz(topic);

  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length) {
        questions = parsed.slice(0, 5).map((q) => ({
          id: uuidv4(),
          question: q.question,
          options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
          answerIndex: Number.isInteger(q.answerIndex) ? q.answerIndex : 0
        }));
      }
    } catch (error) {
      // Keep fallback if JSON parse fails.
    }
  }

  return {
    id: uuidv4(),
    topic,
    questions,
    createdAt: new Date().toISOString()
  };
}

function evaluateQuiz(quiz, answers) {
  let score = 0;

  const result = quiz.questions.map((q, idx) => {
    const selected = answers[idx];
    const correct = selected === q.answerIndex;
    if (correct) {
      score += 1;
    }

    return {
      questionId: q.id,
      selected,
      correctAnswer: q.answerIndex,
      correct
    };
  });

  return {
    score,
    total: quiz.questions.length,
    result
  };
}

module.exports = {
  generateQuiz,
  evaluateQuiz
};
