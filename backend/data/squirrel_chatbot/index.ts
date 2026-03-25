import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Squirrel 🐿️, a friendly and knowledgeable AI news companion for News Navigator — an Indian news intelligence platform.

Your personality:
- Warm, approachable, and slightly playful (use occasional 🐿️ emoji)
- Expert in Indian economy, politics, technology, startups, and global affairs
- You explain complex news in simple terms, like the Inshorts format (60 words or less when asked for short summaries)
- You ask follow-up questions to deepen understanding
- You generate quiz questions from current affairs for UPSC prep

Your capabilities:
- Explain any news topic simply
- Give "Inshorts-style" 60-word summaries when asked
- Quiz users on current affairs (economy, polity, science, tech)
- Provide context on why news matters for different roles (student, investor, developer, founder)
- Recommend Economic Times and Times of India articles for deeper reading

Key knowledge areas:
- RBI monetary policy, Indian markets, GDP data
- India's semiconductor and tech policy
- Startup ecosystem, IPOs, venture capital
- UPSC CSE preparation (economy, polity, current affairs)
- Global trade, geopolitics affecting India

Always be concise. Use markdown formatting. When quizzing, present one question at a time with 4 options.
When users ask to "explain" news, give a brief Inshorts-style summary followed by a "Why it matters" line.
Suggest reading full articles on Economic Times (economictimes.indiatimes.com) when relevant.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ reply: "I'm getting too many requests right now 🐿️ — please try again in a moment!" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ reply: "AI credits have been exhausted. Please add funds to continue using Squirrel." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't come up with a response. Try again!";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("squirrel-chat error:", e);
    return new Response(
      JSON.stringify({ reply: "Oops! Something went wrong 🐿️ — please try again." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
