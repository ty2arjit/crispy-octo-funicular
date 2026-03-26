import { motion } from "framer-motion";
import { BookOpen, RotateCcw, Target, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const UPSCSection = () => {
  return (
    <section id="upsc" className="py-20 md:py-28">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">UPSC Prep</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Current affairs,<br />exam-ready
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every news article becomes a potential UPSC question. Our AI maps headlines to syllabus topics — economy, polity, geography, and more — so you never miss what matters for your exam.
            </p>
            {/* Again variant hero hai main usjko default kar de raha */}
            <Button variant="default" size="lg" className="mt-8" asChild>
              <Link to="/onboarding">Start UPSC Prep</Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BookOpen, title: "Economy", desc: "RBI policy, GDP data, market analysis" },
              { icon: Target, title: "Polity", desc: "Constitutional amendments, judicial rulings" },
              { icon: TrendingUp, title: "Current Affairs", desc: "Real-time news mapped to syllabus" },
              { icon: RotateCcw, title: "Spaced Repetition", desc: "Weak topics resurface until mastered" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="card-elevated p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <item.icon className="w-5 h-5 text-primary mb-3" />
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UPSCSection;
