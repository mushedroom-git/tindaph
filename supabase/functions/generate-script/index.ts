import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITUATION_GUIDE: Record<string, string> = {
  magkano:
    "Buyer is asking about price ('Magkano?'). Acknowledge warmly, justify value (fresh, lutong bahay, portion size) without sounding defensive, then offer to send the menu / price list with delivery slots.",
  ghost:
    "Buyer inquired before but went silent (ghosted). Re-open the conversation gently without guilt-tripping. Offer to hold a slot or answer remaining questions. Keep pressure low.",
  discount:
    "Buyer is asking for a discount. Do NOT cave on price. Reframe around value, suggest a sulit option that fits their budget, or bundle. Stay warm and respectful.",
  firsttime:
    "First-time buyer. Reduce risk: recommend bestseller, explain what to expect, simple ordering steps. Build trust quickly.",
  close:
    "Buyer is ready to order. Confirm details, lock the slot, set clear expectations on delivery window and payment.",
  complaint:
    "Buyer has a complaint. Apologize sincerely (without over-apologizing), take ownership, propose a concrete fix, and ask which option works for them.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const {
      situation,
      extraContext,
      brand,
    }: {
      situation: string;
      extraContext?: string;
      brand: {
        businessName: string;
        oneLiner: string;
        brandVoice: string;
        targetBuyer: string;
        uniqueValue: string;
      };
    } = await req.json();

    const guide = SITUATION_GUIDE[situation] ?? SITUATION_GUIDE.magkano;

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a Filipino MSME sales coach. You write DM/chat replies in warm, natural Taglish for Facebook/Instagram/Viber buyers. Tone: respectful (uses 'po'), confident, never pushy, never salesy. Scripts must be 3-5 short sentences, easy to copy-paste, and end with one clear next step.",
        },
        {
          role: "user",
          content: `Brand: ${brand.businessName}
One-liner: ${brand.oneLiner}
Voice: ${brand.brandVoice}
Target buyer: ${brand.targetBuyer}
Unique value: ${brand.uniqueValue}

Buyer situation: ${situation}
Coaching note: ${guide}

Extra context from seller: ${extraContext?.trim() || "(none)"}

Write the reply script, explain WHY it works, and call out what NOT to say.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_script",
            description: "Return a DM script with rationale",
            parameters: {
              type: "object",
              properties: {
                script: {
                  type: "string",
                  description:
                    "The full Taglish DM reply, 3-5 short sentences, ready to copy-paste.",
                },
                why: {
                  type: "string",
                  description:
                    "1-2 sentence explanation of why this script works for this buyer situation.",
                },
                avoid: {
                  type: "string",
                  description:
                    "1 sentence on what the seller should NOT say in this situation.",
                },
              },
              required: ["script", "why", "avoid"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_script" } },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (res.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add credits in your workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("Script gen failed:", res.status, t);
      throw new Error("Script generation failed");
    }

    const json = await res.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    let parsed = { script: "", why: "", avoid: "" };
    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-script error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
