import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Volume2, VolumeX, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { assistantChat, getCurrentUser } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SQUIRREL_AVATAR = "🐿️";

const SquirrelChatbot = () => {
  const user = getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey there! I'm **Squirrel** 🐿️ — your personal news companion. I can:\n\n• **Explain news** in simple terms (Inshorts style)\n• **Read articles aloud** for you\n• **Quiz you** on current affairs\n• **Answer questions** about today's briefing\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const clean = text.replace(/[*#_`\[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    try {
      const data = await assistantChat(user?.id, allMessages.map((m) => ({ role: m.role, content: m.content })));
      const reply = data?.reply || "Sorry, I couldn't process that. Try again!";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error("Squirrel chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Oops! I had a little hiccup 🐿️ — please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-warm shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="text-2xl">🐿️</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border gradient-warm">
              <span className="text-xl">{SQUIRREL_AVATAR}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-primary-foreground">Squirrel</h3>
                <p className="text-[10px] text-primary-foreground/70">Your AI news companion</p>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground/70" />
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded">
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isSpeaking ? (
                          <><VolumeX className="w-3 h-3" /> Stop</>
                        ) : (
                          <><Volume2 className="w-3 h-3" /> Listen</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-1.5 flex-wrap border-t border-border">
              {["Explain today's top story", "Quiz me", "60s briefing"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="px-2.5 py-1 rounded-full bg-muted text-[11px] text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask Squirrel anything..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                />
                <Button
                  size="icon"
                  variant="default"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SquirrelChatbot;
