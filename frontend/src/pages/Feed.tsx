import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Clock, Headphones, BookOpen, Brain, ChevronRight,
  TrendingUp, Globe, Cpu, Briefcase, ArrowRight, ExternalLink,
  Moon, Sun,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import SquirrelChatbot from "@/components/SquirrelChatbot";

const etLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/The_Economic_Times_logo.svg/1200px-The_Economic_Times_logo.svg.png";

const topics = [
  {
    id: "1",
    icon: TrendingUp,
    category: "Economy",
    title: "RBI Holds Rates Steady Amid Global Uncertainty",
    summary: "The Reserve Bank of India maintained its benchmark repo rate at 6.5% for the eighth consecutive time, balancing inflation concerns with growth targets as global markets remain volatile.",
    sources: 5,
    readTime: "4 min",
    whyMatters: "As someone tracking markets, this signals continued policy stability — but watch for shifts if inflation data surprises next quarter.",
    tags: ["Monetary Policy", "RBI", "Interest Rates"],
    etLink: "https://economictimes.indiatimes.com/markets/rbi-policy",
    sourceName: "Economic Times",
  },
  {
    id: "2",
    icon: Cpu,
    category: "Technology",
    title: "India's Semiconductor Push Gets ₹76,000 Crore Boost",
    summary: "The government approved three new semiconductor fabrication units across Gujarat and Assam, marking India's largest push toward chip self-reliance and reducing dependence on imports.",
    sources: 7,
    readTime: "5 min",
    whyMatters: "This creates massive opportunities in the electronics supply chain — from packaging to design services — with hiring expected to surge in 2026.",
    tags: ["Semiconductors", "Policy", "Manufacturing"],
    etLink: "https://economictimes.indiatimes.com/tech/technology",
    sourceName: "Economic Times",
  },
  {
    id: "3",
    icon: Globe,
    category: "Global Affairs",
    title: "US-China Trade Tensions Ripple Through Asian Markets",
    summary: "New tariff threats from the US administration sent Asian indices tumbling, with the Nifty shedding 1.2% in early trade before recovering on domestic institutional buying.",
    sources: 4,
    readTime: "3 min",
    whyMatters: "Volatility creates entry points for long-term investors, but IT and export-heavy sectors face near-term headwinds from dollar strengthening.",
    tags: ["Trade War", "Markets", "Geopolitics"],
    etLink: "https://economictimes.indiatimes.com/news/international",
    sourceName: "Times of India",
  },
  {
    id: "4",
    icon: Briefcase,
    category: "Startups",
    title: "Three Indian Unicorns File for IPO in Same Week",
    summary: "Zepto, PhysicsWallah, and Ather Energy simultaneously filed draft papers with SEBI, signaling a renewed confidence in public markets after a cautious 2025.",
    sources: 6,
    readTime: "4 min",
    whyMatters: "The IPO pipeline suggests the funding winter is thawing. Watch for secondary market opportunities and what these valuations signal for late-stage startups.",
    tags: ["IPO", "Unicorns", "Venture Capital"],
    etLink: "https://economictimes.indiatimes.com/tech/startups",
    sourceName: "Economic Times",
  },
];

const Feed = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

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
            <Button variant="ghost" size="sm">
              <Headphones className="w-4 h-4 mr-1" />
              60s Briefing
            </Button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 container max-w-3xl">
        {/* ET Branding */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-muted/50 border border-border">
          <img
            src={etLogoUrl}
            alt="Economic Times"
            className="h-6 object-contain dark:invert"
          />
          <span className="text-xs text-muted-foreground">Powered by</span>
          <a
            href="https://economictimes.indiatimes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline ml-auto flex items-center gap-1"
          >
            Visit ET <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Greeting */}
        <div className="mb-10">
          <h1 className="font-serif text-2xl md:text-3xl font-bold">Your Morning Briefing</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            March 24, 2026 · 4 briefings from 22 sources
          </p>
        </div>

        {/* Reading mode toggle */}
        <div className="flex gap-2 mb-8">
          {["Short", "Detailed", "Audio"].map((mode) => (
            <button
              key={mode}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === "Short"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {mode === "Audio" && <Headphones className="w-3 h-3 inline mr-1" />}
              {mode}
            </button>
          ))}
        </div>

        {/* Topic Cards */}
        <div className="space-y-4">
          {topics.map((topic, i) => (
            <motion.article
              key={topic.id}
              className="card-elevated overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <topic.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {topic.category}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">
                    {topic.sourceName}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {topic.sources} sources · {topic.readTime}
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold leading-tight">{topic.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{topic.summary}</p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {topic.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Why this matters */}
                <button
                  onClick={() => setExpandedId(expandedId === topic.id ? null : topic.id)}
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronRight className={`w-3 h-3 transition-transform ${expandedId === topic.id ? "rotate-90" : ""}`} />
                  Why this matters to me
                </button>

                {expandedId === topic.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <p className="text-sm leading-relaxed">{topic.whyMatters}</p>
                  </motion.div>
                )}

                <div className="editorial-divider mt-5" />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" asChild>
                      <Link to="/quiz">
                        <Brain className="w-3.5 h-3.5 mr-1" />
                        Take Quiz
                      </Link>
                    </Button>
                  </div>
                  <a
                    href={topic.etLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    Read on ET
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
