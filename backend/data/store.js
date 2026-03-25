const { v4: uuidv4 } = require("uuid");

const users = new Map();
const quizzes = new Map();
const briefings = new Map();

function createUser({ name, email, role, interests, readingStyle }) {
  const id = uuidv4();
  const user = {
    id,
    name,
    email,
    role,
    interests: interests || [],
    readingStyle: readingStyle || "short",
    interestGraph: {},
    weakTopics: {},
    isPro: false,
    interactions: [],
    createdAt: new Date().toISOString()
  };

  user.interests.forEach((interest) => {
    user.interestGraph[interest] = 5;
  });

  users.set(id, user);
  return user;
}

function getUserById(id) {
  return users.get(id);
}

function getUserByEmail(email) {
  return Array.from(users.values()).find((u) => u.email === email);
}

function updateUser(id, payload) {
  const user = users.get(id);
  if (!user) {
    return null;
  }

  const updated = {
    ...user,
    ...payload,
    updatedAt: new Date().toISOString()
  };

  users.set(id, updated);
  return updated;
}

function logInteraction(userId, interaction) {
  const user = users.get(userId);
  if (!user) {
    return;
  }

  user.interactions.push({
    ...interaction,
    at: new Date().toISOString()
  });

  if (interaction.topic) {
    user.interestGraph[interaction.topic] = (user.interestGraph[interaction.topic] || 0) + 1;
  }

  users.set(userId, user);
}

function saveBriefing(userId, topic, briefing) {
  const key = `${userId}:${topic}`;
  briefings.set(key, briefing);
}

function getBriefing(userId, topic) {
  return briefings.get(`${userId}:${topic}`);
}

function saveQuiz(userId, quiz) {
  quizzes.set(`${userId}:${quiz.id}`, quiz);
}

function getQuiz(userId, quizId) {
  return quizzes.get(`${userId}:${quizId}`);
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  logInteraction,
  saveBriefing,
  getBriefing,
  saveQuiz,
  getQuiz
};
