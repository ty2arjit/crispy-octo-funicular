import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Shield, Zap } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handlePayment = () => {
    setLoading(true);

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Razorpay test key
        amount: 29900, // ₹299 in paise
        currency: "INR",
        name: "News Navigator",
        description: "Pro Plan - Monthly Subscription",
        image: "",
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}\n\nThis is a test transaction.`);
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#e05a2b",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    };
    document.body.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">News Navigator</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold mt-4">Upgrade to Pro</h1>
          <p className="text-muted-foreground mt-2">Unlock the full News Navigator experience</p>
        </div>

        <div className="rounded-xl border-2 border-primary bg-card p-8">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="font-serif text-5xl font-bold">₹299</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "Unlimited daily briefings",
              "Audio narration (TTS)",
              "UPSC deep prep mode",
              "60-second daily briefing",
              "Spaced repetition quizzes",
              "Detailed reading mode",
              "Priority feed updates",
              "Squirrel AI companion (unlimited)",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant="hero"
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Loading..." : "Pay ₹299 with Razorpay"}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            Secure payment via Razorpay (Test Mode)
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Cancel anytime. No questions asked.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
