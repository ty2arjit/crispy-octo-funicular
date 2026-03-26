import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight, BookOpen, Brain, Headphones } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered News Intelligence
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            One briefing.
            <br />
            <span className="text-primary">Not eight articles.</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            News Navigator turns passive reading into an active, personalized intelligence experience — tailored to your role, interests, and learning goals.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Again variant hero is not defined i am convertimg it to defualt make it hero once you define it  */}
            <Button variant="default" size="lg" asChild>
              <Link to="/onboarding">
                Start Reading Smarter
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            {/* Yaha pe variant hero-outline hai abhi ke liye default kar raha baad mein jab define kar dena tab hero-outline kar dena  */}
            <Button variant="default" size="lg" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              { icon: BookOpen, label: "Smart Briefings", value: "50K+" },
              { icon: Brain, label: "Quiz Questions", value: "10K+" },
              { icon: Headphones, label: "Audio Hours", value: "2K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 mx-auto text-primary mb-2" />
                <div className="font-bold text-xl">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
