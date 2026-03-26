import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Zap,
  Clock,
  Headphones,
  BookOpen,
  Brain,
  ChevronRight,
  ExternalLink,
  Moon, Sun,
  Play,
  Pause
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import SquirrelChatbot from "../components/SquirrelChatbot";
import {
  getCurrentUser,
  getDailyTopics,
  getBriefing,
  logFeedInteraction,
  mapReadingMode,
  synthesizeNarration
} from "../lib/api";

const modeOptions = [
  { label: "Short", value: "short" },
  { label: "Detailed", value: "detailed" },
  { label: "60-second", value: "daily60" }
];

const Feed = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<string[]>([]);
  const [briefings, setBriefings] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState("short");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [speakingTopic, setSpeakingTopic] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/onboarding");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const mode = mapReadingMode(user.readingStyle);
        setSelectedMode(mode);

        const topicList = await getDailyTopics(user.id);
        setTopics(topicList);

        const selected = topicList.slice(0, 4);
        const briefingData = await Promise.all(selected.map((topic) => getBriefing(user.id, topic, mode)));
        setBriefings(briefingData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load feed");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [navigate]);

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
    []
  );

  const reloadBriefingsForMode = async (mode: string) => {
    if (!user || !topics.length) return;
    setSelectedMode(mode);
    setLoading(true);
    setError("");
    try {
      const selected = topics.slice(0, 4);
      const briefingData = await Promise.all(selected.map((topic) => getBriefing(user.id, topic, mode)));
      setBriefings(briefingData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to refresh feed");
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async (topic: string, text: string) => {
    if (!user) return;

    if (speakingTopic === topic) {
      window.speechSynthesis.cancel();
      setSpeakingTopic(null);
      return;
    }

    setSpeakingTopic(topic);
    try {
      const narration = await synthesizeNarration(user.id, text);
      if (narration.audioDataUri) {
        const audio = new Audio(narration.audioDataUri);
        audio.onended = () => setSpeakingTopic(null);
        await audio.play();
      } else {
        const utterance = new SpeechSynthesisUtterance(narration.fallbackText);
        utterance.onend = () => setSpeakingTopic(null);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingTopic(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">News Navigator</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/quiz">
                <Brain className="w-4 h-4 mr-1" />
                Quiz Mode
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/payment">Upgrade</Link>
            </Button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 container max-w-3xl">
        <div className="mb-10">
          <h1 className="font-serif text-2xl md:text-3xl font-bold">Your Personalized Briefing</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {formattedDate} · {briefings.length} briefings
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {modeOptions.map((mode) => (
            <button
              key={mode.value}
              onClick={() => void reloadBriefingsForMode(mode.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode.value === selectedMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading your feed...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-4">
          {briefings.map((briefing, i) => (
            <motion.article
              key={briefing.id}
              className="card-elevated overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {briefing.topic}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">
                    curated
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {briefing.articles.length} sources
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold leading-tight">{briefing.summary}</h2>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {(briefing.keyTakeaways || []).slice(0, 4).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setExpandedId(expandedId === briefing.id ? null : briefing.id);
                    if (user) {
                      void logFeedInteraction(user.id, briefing.topic, "briefing-view");
                    }
                  }}
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronRight className={`w-3 h-3 transition-transform ${expandedId === briefing.id ? "rotate-90" : ""}`} />
                  Why this matters to me
                </button>

                {expandedId === briefing.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <p className="text-sm leading-relaxed">{briefing.whyThisMatters}</p>
                    <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {(briefing.followUpQuestions || []).map((q: string) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <div className="editorial-divider mt-5" />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" asChild>
                      <Link to={`/quiz?topic=${encodeURIComponent(briefing.topic)}`}>
                        <Brain className="w-3.5 h-3.5 mr-1" />
                        Take Quiz
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => void handleListen(briefing.topic, briefing.summary)}
                    >
                      {speakingTopic === briefing.topic ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                      <Headphones className="w-3.5 h-3.5 mr-1" />
                      Listen
                    </Button>
                  </div>
                  {briefing.articles[0]?.link && (
                    <a
                      href={briefing.articles[0].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Source
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      {/* Squirrel Chatbot */}
      <SquirrelChatbot />
    </div>
  );
};

export default Feed;
