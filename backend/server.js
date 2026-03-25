const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const feedRoutes = require("./routes/feedRoutes");
const quizRoutes = require("./routes/quizRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const assistantRoutes = require("./routes/assistantRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "news-navigator-api" });
});

app.use("/api/users", userRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/assistant", assistantRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`News Navigator backend running on port ${PORT}`);
});
