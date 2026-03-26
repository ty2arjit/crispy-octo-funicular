import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { ArrowRight, ArrowLeft, User, Briefcase, GraduationCap, Code, Zap } from "lucide-react";
import { registerUser, saveCurrentUser } from "../lib/api";

const roles = [
  { id: "student", label: "Student", icon: GraduationCap, desc: "Preparing for exams or staying informed" },
  { id: "investor", label: "Investor", icon: Briefcase, desc: "Tracking markets and macro trends" },
  { id: "developer", label: "Developer", icon: Code, desc: "Following tech, startups, and innovation" },
  { id: "founder", label: "Founder", icon: User, desc: "Strategy, competition, and opportunity" },
];

const interests = [
  "Economy & Markets", "Politics & Policy", "Technology", "Startups",
  "Global Affairs", "Climate & Energy", "Science", "Sports",
  "Entertainment", "Education", "Healthcare", "Real Estate",
];

const readingStyles = [
  { id: "quick", label: "60-second briefings", desc: "Headlines and key takeaways only" },
  { id: "balanced", label: "Smart summaries", desc: "The sweet spot — context without overload" },
  { id: "deep", label: "Deep dives", desc: "Full analysis, data, and expert views" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const canProceed =
    (step === 0 && selectedRole && name.trim().length >= 2 && /@/.test(email)) ||
    (step === 1 && selectedInterests.length >= 2) ||
    (step === 2 && selectedStyle);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const user = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: selectedRole as "student" | "investor" | "developer" | "founder",
        interests: selectedInterests,
        readingStyle: selectedStyle
      });
      saveCurrentUser(user);
      navigate("/feed");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to create your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">News Navigator</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-serif text-2xl font-bold">What best describes you?</h2>
              <p className="text-sm text-muted-foreground mt-2">This helps us tailor your briefings.</p>
              <div className="grid gap-3 mt-6">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <role.icon className={`w-5 h-5 mb-2 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-semibold text-sm">{role.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{role.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-serif text-2xl font-bold">What interests you?</h2>
              <p className="text-sm text-muted-foreground mt-2">Pick at least 2 topics. We'll curate your feed around these.</p>
              <div className="flex flex-wrap gap-2 mt-8">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-serif text-2xl font-bold">How do you prefer to read?</h2>
              <p className="text-sm text-muted-foreground mt-2">You can change this anytime.</p>
              <div className="space-y-3 mt-8">
                {readingStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedStyle === style.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className="font-semibold text-sm">{style.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-10">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {/* Again the variant is hero abhi ke liye i am converting it to default and jab define kar dena tab default ko hero se replace kar dena  */}
          <Button
            variant="default"
            disabled={!canProceed || loading}
            onClick={() => (step < 2 ? setStep((s) => s + 1) : handleFinish())}
          >
            {step < 2 ? "Next" : loading ? "Launching..." : "Launch My Feed"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
