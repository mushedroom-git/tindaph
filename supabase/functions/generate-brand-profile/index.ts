import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const {
      product,
      buyer,
      diff,
      why,
      vibe,
      surprise,
      businessName,
      visualStyle,
    } = await req.json();

    if (!product || !buyer || !diff || !why) {
      return new Response(
        JSON.stringify({ error: "Missing required brand inputs." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a senior Filipino brand strategist for home-based food sellers (MSMEs). You write tight, warm Taglish-friendly positioning. You also pick brand color palettes that match a chosen visual style and food category. Never invent claims; rephrase what the founder gave you with sharper, more vivid language. Keep every field within its character limit. AVOID overused Filipino food-seller clichés such as: 'lutong may pagmamahal', 'gawa sa puso', 'authentic recipes ni Lola', 'sarap ng bahay', 'hatid sa pintuan', 'lutong bahay na gawa sa pagmamahal'. Instead use specific, concrete details the founder actually mentioned — a real dish, a real story beat, a real buyer moment. The output should feel written by this specific founder, not copied from a generic MSME template.",
        },
        {
          role: "user",
          content: `Build a complete brand profile.

Product / delivery: ${product}
Ideal buyer + their problem: ${buyer}
Competitors vs me: ${diff}
Why I started: ${why}
Seller vibe: ${vibe}
Customer surprise: ${surprise}
Business name: ${businessName || "(blank — suggest a memorable Filipino-flavored name)"}
Visual style: ${visualStyle}

Return:
- businessName (≤30 chars)
- tagline (≤60 chars, punchy)
- oneLiner (≤180 chars)
- targetBuyer (≤140 chars)
- uniqueValue (≤140 chars)
- brandVoice (≤50 chars)
- emotionalHook (≤180 chars, founder story compressed)
- contentTip (≤200 chars, concrete posting tip using the surprise)
- photographyMood (1 vivid sentence)
- palette: exactly 5 colors fitting visual style "${visualStyle}". Each: { name (evocative Filipino-flavored), role (Primary|Secondary|Background|Accent|Neutral), hex (#RRGGBB) }. Primary must contrast on white; Background must be a light tint.
- weeklyRhythm: { postsPerWeek (3–5 integer), schedule (array of 3–5 objects, one per posting day): each { day (full name), abbr (3-letter), contentType (short label like "Product story"), tip (one punchy sentence advice in Taglish) } }. Match rhythm to the brand vibe and buyer lifestyle.
- voiceRules: { useWords (exactly 5 Taglish words or short phrases this brand should use often), avoidWords (exactly 3 words or phrases that feel off-brand), example (one complete sentence showing the brand voice in action, in Taglish) }`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_brand_profile",
            description: "Return the complete brand profile",
            parameters: {
              type: "object",
              properties: {
                businessName: { type: "string" },
                tagline: { type: "string" },
                oneLiner: { type: "string" },
                targetBuyer: { type: "string" },
                uniqueValue: { type: "string" },
                brandVoice: { type: "string" },
                emotionalHook: { type: "string" },
                contentTip: { type: "string" },
                photographyMood: { type: "string" },
                palette: {
                  type: "array",
                  minItems: 5,
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                      hex: { type: "string" },
                    },
                    required: ["name", "role", "hex"],
                  },
                },
                weeklyRhythm: {
                  type: "object",
                  properties: {
                    postsPerWeek: { type: "number" },
                    schedule: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          day: { type: "string" },
                          abbr: { type: "string" },
                          contentType: { type: "string" },
                          tip: { type: "string" },
                        },
                        required: ["day", "abbr", "contentType", "tip"],
                      },
                    },
                  },
                  required: ["postsPerWeek", "schedule"],
                },
                voiceRules: {
                  type: "object",
                  properties: {
                    useWords: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
                    avoidWords: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                    example: { type: "string" },
                  },
                  required: ["useWords", "avoidWords", "example"],
                },
              },
              required: [
                "businessName",
                "tagline",
                "oneLiner",
                "targetBuyer",
                "uniqueValue",
                "brandVoice",
                "emotionalHook",
                "contentTip",
                "photographyMood",
                "palette",
                "weeklyRhythm",
                "voiceRules",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_brand_profile" } },
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
      console.error("Brand profile gen failed:", res.status, t);
      throw new Error("Brand profile generation failed");
    }

    const json = await res.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    // Generate a realistic hero photo using the brand profile
    let heroImage: string | null = null;
    try {
      const paletteHexes = (parsed.palette || []).map((p: any) => p.hex).join(", ");
      const imgPrompt = `Photorealistic editorial food photograph hero shot for a Filipino home-based food brand.
Product / dish: ${product}
Visual style: ${visualStyle}
Mood: ${parsed.photographyMood}
Color palette to echo (props, surfaces, lighting): ${paletteHexes}
Composition: appetizing close-up, natural daylight, shallow depth of field, styled props (banana leaf, ceramic bowl, native textiles where appropriate), no text, no watermark, no logo, no people faces, square framing.`;
      const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: imgPrompt }],
          modalities: ["image", "text"],
        }),
      });
      if (imgRes.ok) {
        const imgJson = await imgRes.json();
        heroImage = imgJson.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
      } else {
        console.error("hero image gen failed:", imgRes.status, await imgRes.text());
      }
    } catch (e) {
      console.error("hero image error:", e);
    }

    return new Response(JSON.stringify({ ...parsed, heroImage }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-brand-profile error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
