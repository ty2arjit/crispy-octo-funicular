import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Tell Us About You", desc: "Quick onboarding quiz — your role, interests, and reading style." },
  { num: "02", title: "Get Your Daily Feed", desc: "AI curates topics based on your profile. One briefing per topic, not ten links." },
  { num: "03", title: "Read, Listen, or Quiz", desc: "Choose short summaries, detailed deep-dives, or audio narration. Then test yourself." },
  { num: "04", title: "Get Smarter Every Day", desc: "Your interest graph evolves. Tomorrow's feed is better than today's." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3">
            Four steps to clarity
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex gap-6 mb-10 last:mb-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {step.num}
                </span>
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && <div className="editorial-divider mt-8" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
