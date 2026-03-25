// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Check, Shield, Zap } from "lucide-react";
// import { useTheme } from "@/hooks/useTheme";
// import { confirmPro, createPaymentOrder, getCurrentUser } from "@/lib/api";

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// const PaymentPage = () => {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const { theme } = useTheme();
//   const user = getCurrentUser();

//   const handlePayment = async () => {
//     if (!user) {
//       setMessage("Please complete onboarding before upgrading.");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const { order } = await createPaymentOrder(user.id);

//       if (order.provider === "mock") {
//         await confirmPro(user.id);
//         setMessage("Pro activated in hackathon demo mode.");
//         setLoading(false);
//         return;
//       }

//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => {
//         if (!window.Razorpay) {
//           setMessage("Razorpay script failed to load.");
//           setLoading(false);
//           return;
//         }

//         const options = {
//           key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
//           order_id: order.id,
//           amount: order.amount,
//           currency: order.currency,
//           name: "News Navigator",
//           description: "Pro Plan - Monthly Subscription",
//           handler: async function () {
//             await confirmPro(user.id);
//             setMessage("Payment successful. Pro activated.");
//           },
//           prefill: {
//             name: user.name || "",
//             email: user.email || "",
//           },
//           theme: {
//             color: "#e05a2b",
//           },
//           modal: {
//             ondismiss: function () {
//               setLoading(false);
//             },
//           },
//         };

//         const rzp = new window.Razorpay(options);
//         rzp.open();
//         setLoading(false);
//       };

//       document.body.appendChild(script);
//     } catch (error) {
//       setMessage(error instanceof Error ? error.message : "Unable to start checkout.");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-flex items-center gap-2 mb-6">
//             <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
//               <Zap className="w-4 h-4 text-primary-foreground" />
//             </div>
//             <span className="font-bold text-lg">News Navigator</span>
//           </Link>
//           <h1 className="font-serif text-3xl font-bold mt-4">Upgrade to Pro</h1>
//           <p className="text-muted-foreground mt-2">Unlock the full News Navigator experience</p>
//         </div>

//         <div className="rounded-xl border-2 border-primary bg-card p-8">
//           <div className="flex items-baseline gap-1 mb-6">
//             <span className="font-serif text-5xl font-bold">₹299</span>
//             <span className="text-muted-foreground">/month</span>
//           </div>

//           <ul className="space-y-3 mb-8">
//             {[
//               "Unlimited daily briefings",
//               "Audio narration (TTS)",
//               "UPSC deep prep mode",
//               "60-second daily briefing",
//               "Spaced repetition quizzes",
//               "Detailed reading mode",
//               "Priority feed updates",
//               "Squirrel AI companion (unlimited)",
//             ].map((feature) => (
//               <li key={feature} className="flex items-start gap-2 text-sm">
//                 <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
//                 {feature}
//               </li>
//             ))}
//           </ul>

//           <Button
//             variant="hero"
//             className="w-full"
//             size="lg"
//             onClick={handlePayment}
//             disabled={loading}
//           >
//             {loading ? "Loading..." : "Pay ₹299 with Razorpay"}
//           </Button>

//           <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
//             <Shield className="w-3 h-3" />
//             Secure payment via Razorpay (auto-fallback to demo mode)
//           </div>
//           {message && <p className="mt-3 text-center text-xs text-primary">{message}</p>}
//         </div>

//         <p className="text-center text-xs text-muted-foreground mt-6">
//           Cancel anytime. No questions asked.
//         </p>
//       </motion.div>
//     </div>
//   );
// };

// export default PaymentPage;
