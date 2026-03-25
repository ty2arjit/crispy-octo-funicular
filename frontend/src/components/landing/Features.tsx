import { motion } from "framer-motion";
import { Layers, Brain, Headphones, Target, BarChart3, Sparkles } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-Source Briefings",
    description: "We combine 8+ articles on a topic into one crisp, intelligent summary — saving you hours of reading.",
  },
  {
    icon: Sparkles,
    title: '"Why This Matters to Me"',
    description: "Every briefing is contextualized to your role — whether you're a founder, student, developer, or investor.",
  },
  {
    icon: Brain,
    title: "Auto-Generated Quizzes",
    description: "After each briefing, test your understanding with smart questions generated from real news content.",
  },
  {
    icon: Headphones,
    title: "Audio Briefings",
    description: "Listen to your daily news with natural TTS narration. Perfect for commutes, workouts, or multitasking.",
  },
  {
    icon: Target,
    title: "UPSC & Competitive Exam Prep",
    description: "Economy, polity, current affairs — all mapped to real headlines. Spaced repetition for weak topics.",
  },
  {
    icon: BarChart3,
    title: "Evolving Interest Graph",
    description: "Your feed gets smarter every day. Every click, quiz, and read refines what you see tomorrow.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Features</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3">
            Reading, reimagined
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every feature is designed to make you more informed in less time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="card-elevated p-6 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
