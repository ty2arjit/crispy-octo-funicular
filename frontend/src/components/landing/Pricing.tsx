import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "3 briefings per day",
      "Basic quiz mode",
      "Short summary format",
      "Interest-based feed",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    description: "For serious readers & aspirants",
    features: [
      "Unlimited briefings",
      "Audio narration (TTS)",
      "UPSC deep prep mode",
      "60-second daily briefing",
      "Spaced repetition quizzes",
      "Detailed reading mode",
      "Priority feed updates",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-sm">
            Powered by Razorpay. Secure payments, instant activation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`rounded-xl p-8 border ${
                plan.featured
                  ? "border-primary bg-card shadow-lg shadow-primary/5 relative"
                  : "border-border bg-card"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </span>
              )}
              <h3 className="font-semibold text-xl">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
              // Abhi ke liye variant ko default kar de raha jab hero ya hero-outline define kar dena tab defult hata ke neeche wala part use kar lena 
                // variant={plan.featured ? "hero" : "hero-outline"}
                variant="default"
                className="w-full mt-8"
                asChild
              >
                <Link to={plan.featured ? "/payment" : "/onboarding"}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
