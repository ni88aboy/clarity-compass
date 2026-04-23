// Edge function: ethical decision clarifier via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a calm, neutral, non-judgmental decision clarifier.
Your role is NEVER to tell the user what to do. You only help them think clearly.
Tone: calm, clear, neutral, supportive, gentle. Use plain language. No hype, no pressure, no advice verbs like "you should".
Always frame insights as observations, patterns, or questions — never directives.
Avoid moralizing. Respect autonomy. Acknowledge emotional weight without amplifying it.

You will analyze a single decision the user is considering and return a structured ethical reflection.

Output STRICT JSON matching this schema (no markdown, no commentary):
{
  "summary": string,                       // 1 short neutral sentence describing what this decision touches
  "categories": {
    "pros":               { "title": "Pros",               "points": string[] },
    "cons":               { "title": "Cons",               "points": string[] },
    "risks":              { "title": "Risks",              "points": string[] },
    "opportunities":      { "title": "Opportunities",      "points": string[] },
    "shortTermImpact":    { "title": "Short-term impact",  "points": string[] },
    "longTermImpact":     { "title": "Long-term impact",   "points": string[] }
  },
  "reflection": string,                    // 2-4 sentences. Begin with "This decision..." Style: "This decision affects your X, Y and Z. Here are the patterns I notice: ..."
  "questions": string[],                   // 3 open, non-leading questions to deepen clarity
  "clarityScore": number,                  // 0-100. NOT a recommendation. Represents how internally clear/coherent the decision currently appears given the user's framing (low = many unknowns or conflicts; high = well-articulated tradeoffs). Never imply yes/no.
  "clarityLabel": string                   // short phrase: "Still forming", "Becoming clearer", "Clear", "Very clear"
}

Each category should contain 3-5 concise bullet points (max ~14 words each).
If the user's input is too vague, still produce something useful and reflect the vagueness in a lower clarityScore.
Never refuse. Never include disclaimers about being an AI. Never recommend professionals unless the user explicitly mentions a clinical/legal/medical situation.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { decision, context } = await req.json();
    if (!decision || typeof decision !== "string" || decision.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Please describe your decision in a sentence." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (decision.length > 2000 || (context && context.length > 4000)) {
      return new Response(JSON.stringify({ error: "Input too long." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg =
      `Decision: ${decision.trim()}` +
      (context && context.trim() ? `\n\nAdditional context the user shared:\n${context.trim()}` : "");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Many people are reflecting right now. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable Cloud settings." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Reflection unavailable right now." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // try to recover JSON from any wrapping
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: "Could not parse reflection." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("clarify error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
