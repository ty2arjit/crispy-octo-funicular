import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Moon, Sun, ChevronLeft,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import SquirrelChatbot from "@/components/SquirrelChatbot";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

const sampleQuestions: Question[] = [
  {
    id: "1",
    question: "What is the current repo rate maintained by the RBI?",
    options: ["5.5%", "6.0%", "6.5%", "7.0%"],
    correct: 2,
    explanation: "The RBI has maintained the repo rate at 6.5% for eight consecutive policy meetings, balancing inflation management with growth support.",
    topic: "Economy",
    difficulty: "Easy",
  },
  {
    id: "2",
    question: "How much funding has the government approved for new semiconductor fabrication units?",
    options: ["₹50,000 Crore", "₹76,000 Crore", "₹1,00,000 Crore", "₹25,000 Crore"],
    correct: 1,
    explanation: "The government approved ₹76,000 Crore for three new semiconductor fabrication units across Gujarat and Assam.",
    topic: "Technology",
    difficulty: "Medium",
  },
  {
    id: "3",
    question: "Which of the following companies did NOT file for IPO recently?",
    options: ["Zepto", "PhysicsWallah", "Ather Energy", "Swiggy"],
    correct: 3,
    explanation: "Zepto, PhysicsWallah, and Ather Energy filed draft papers with SEBI. Swiggy had already completed its IPO earlier.",
    topic: "Startups",
    difficulty: "Easy",
  },
  {
    id: "4",
    question: "What was the impact of US-China trade tensions on the Nifty index?",
    options: ["Rose 2%", "Fell 1.2%", "Remained unchanged", "Fell 3.5%"],
    correct: 1,
    explanation: "The Nifty shed 1.2% in early trade due to new tariff threats but recovered on domestic institutional buying.",
    topic: "Global Affairs",
    difficulty: "Medium",
  },
  {
    id: "5",
    question: "Which regulatory body reviews IPO draft papers in India?",
    options: ["RBI", "SEBI", "IRDAI", "NABARD"],
    correct: 1,
    explanation: "The Securities and Exchange Board of India (SEBI) reviews all IPO draft red herring prospectus filings.",
    topic: "Polity",
    difficulty: "Easy",
  },
  {
    id: "6",
    question: "Where are the new semiconductor fabrication units planned?",
    options: ["Karnataka and Tamil Nadu", "Gujarat and Assam", "Maharashtra and Telangana", "Delhi and UP"],
    correct: 1,
    explanation: "The three new semiconductor fabrication units are planned across Gujarat and Assam as part of India's chip self-reliance push.",
    topic: "Technology",
    difficulty: "Hard",
  },
];

const Quiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const question = sampleQuestions[currentQ];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnsweredCount((c) => c + 1);
    if (index === question.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < sampleQuestions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredCount(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/feed">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Feed
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-bold">Quiz Mode</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Score: {score}/{answeredCount}
            </Badge>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 container max-w-2xl">
        {!finished ? (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-muted-foreground">
                Question {currentQ + 1} of {sampleQuestions.length}
              </span>
              <div className="flex gap-1">
                {sampleQuestions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1 rounded-full ${
                      i < currentQ ? "bg-primary" : i === currentQ ? "bg-primary/50" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Topic & Difficulty */}
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="text-xs">{question.topic}</Badge>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  question.difficulty === "Hard"
                    ? "bg-destructive/10 text-destructive"
                    : question.difficulty === "Medium"
                    ? "bg-accent/20 text-accent-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {question.difficulty}
              </Badge>
            </div>

            {/* Question */}
            <h2 className="font-serif text-xl md:text-2xl font-bold mb-8 leading-tight">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, i) => {
                let state = "default";
                if (selectedAnswer !== null) {
                  if (i === question.correct) state = "correct";
                  else if (i === selectedAnswer) state = "incorrect";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      state === "correct"
                        ? "border-sage bg-sage/10"
                        : state === "incorrect"
                        ? "border-destructive bg-destructive/5"
                        : selectedAnswer !== null
                        ? "border-border opacity-50"
                        : "border-border hover:border-foreground/20 hover:bg-muted/50"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      state === "correct"
                        ? "bg-sage text-primary-foreground"
                        : state === "incorrect"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {state === "correct" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : state === "incorrect" ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-muted border border-border"
              >
                <p className="text-xs font-semibold text-primary mb-1">Explanation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {question.explanation}
                </p>
                <Button variant="hero" size="sm" className="mt-4" onClick={handleNext}>
                  {currentQ < sampleQuestions.length - 1 ? "Next Question" : "See Results"}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-3xl font-bold">Quiz Complete!</h2>
            <p className="mt-3 text-muted-foreground">
              You scored <span className="font-bold text-foreground">{score}</span> out of <span className="font-bold text-foreground">{sampleQuestions.length}</span>
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              {score === sampleQuestions.length
                ? "🎉 Perfect score! You're on fire!"
                : score >= sampleQuestions.length * 0.7
                ? "💪 Great job! Keep it up."
                : "📚 Keep reading — you'll get there!"}
            </div>
            <div className="mt-8 flex gap-3 justify-center">
              <Button variant="hero-outline" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Try Again
              </Button>
              <Button variant="hero" asChild>
                <Link to="/feed">Back to Feed</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <SquirrelChatbot />
    </div>
  );
};

export default Quiz;
