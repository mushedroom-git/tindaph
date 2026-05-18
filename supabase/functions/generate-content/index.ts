import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Trend = {
  id: string;
  name: string;
  description: string;
  format: string;
  example: string;
  audience: string;
  freshness: string;
  outputShape: "dual" | "single" | "carousel";
};

// Curated trend library — edit this list to keep trends fresh.
const TRENDS: Trend[] = [
  {
    id: "mil-vs-genz",
    name: "Millennial vs Gen Z caption",
    description:
      "One image, two captions side-by-side: how a Millennial would write it vs how a Gen Z would write it. Highly shareable on FB right now.",
    format:
      "Return TWO captions for the SAME image. They must feel VERY different in length and energy.\n- Caption 1 label = 'Millennial Marketing Team'. Voice: polished, full sentences, sentimental/aspirational, 3-5 sentences (40-70 words), tasteful emojis (🥺❤️✨), references like 'adulting', 'lutong bahay nostalgia', proper grammar, soft CTA.\n- Caption 2 label = 'Gen Z Social Media Team'. Voice: chaotic-good, lowercase or sentence-case fragments, ONE short line only (max 12 words, ~60 chars). Heavy Taglish Gen Z slang ('lowkey', 'fr fr', 'ngl', 'ate', 'core', 'slay', 'no notes', 'delulu', 'aura'). USE 4-7 EMOJIS — Gen Z posts are emoji-maxxed (💅✨🔥😭🤌🫶🥹💯🙏). Sprinkle them between words and at the end. NO call to action, NO full sentences. Should read like a meme caption, not an ad.\nThe contrast in LENGTH is the whole joke — never make the Gen Z caption long, but DO make it emoji-heavy.",
    example:
      "Millennial: 'Drive smarter and smoother with the Toyota Wigo! Built for effortless city driving with ease and efficiency. The smallest car in the lineup gets a new look, more cabin space, and tech upgrades for a safer, comfier road trip. ✨'\nGen Z: 'wigo ate fr fr 💅✨🔥 no notes 😭🤌'",
    audience: "Mixed FB feed, Millennials + Gen Z buyers",
    freshness: "Hot this month",
    outputShape: "dual",
  },
  {
    id: "pov",
    name: "POV / 'Tell me without telling me'",
    description:
      "POV-style hook that puts the buyer inside a relatable scene. Drives high comment engagement.",
    format:
      "Single caption that opens with 'POV:' or 'Tell me you ___ without telling me you ___'. Paint a vivid, oddly specific Filipino scenario tied to the product. End with soft CTA.",
    example:
      "POV: 5pm na, traffic, gutom ka, and you remember may natitira pang kare-kare sa ref. 🥲 Reserve your Sunday batch — link sa comments.",
    audience: "Gen Z + younger Millennials",
    freshness: "Evergreen viral format",
    outputShape: "single",
  },
  {
    id: "carousel-hook",
    name: "Carousel swipe hook",
    description:
      "Caption written for a multi-slide carousel post. Strong scroll-stopping line + curiosity gap.",
    format:
      "Single caption built around a swipe hook. First line MUST be a scroll-stopper (e.g. 'Swipe para sa #3 🤯' or '5 reasons bakit ubos agad ang ___'). Then a short list-style preview. End with CTA.",
    example:
      "Swipe para sa #3 🤯 — 5 dahilan bakit ubos agad ang adobo namin tuwing Sunday. Slot is limited, message us to reserve.",
    audience: "FB + IG carousel viewers",
    freshness: "Always works",
    outputShape: "carousel",
  },
  {
    id: "walang-basagan",
    name: "'Walang basagan ng trip' relatable",
    description:
      "Light, self-aware, very Pinoy FB humor. Feels like a repost from a barkada page.",
    format:
      "Single short caption with playful self-deprecating humor. Use phrases like 'walang basagan ng trip', 'pak ganern', 'charot'. Make the product the punchline, not the lecture. Soft CTA.",
    example:
      "Diet ko? Magsisimula bukas. Walang basagan ng trip. 😌 Today's batch of crispy pata is up — order na bago mag-second helpings ang iba.",
    audience: "Titas + Millennials on FB",
    freshness: "Steady favorite",
    outputShape: "single",
  },
  {
    id: "before-after",
    name: "Before / after reveal",
    description:
      "Transformation framing — raw to plated, hungry to fed, doubtful to obsessed.",
    format:
      "Single caption with a clear 'before → after' arc in 2-3 short lines. Make the after feel earned. End with CTA.",
    example:
      "Before: 'Magkano ba talaga ang sulit na ulam for 4?'\nAfter: One bite ng kare-kare namin — sagot na. P420, good for 3-4. Slots open this Sunday.",
    audience: "Practical buyers, value seekers",
    freshness: "Evergreen",
    outputShape: "single",
  },
  {
    id: "genz-slang",
    name: "Pure Gen Z slang post",
    description:
      "All-in Gen Z voice: lowercase, slang-heavy, chaotic-good energy. For brands targeting younger buyers.",
    format:
      "Single short caption, all lowercase, heavy on Gen Z Taglish slang ('delulu', 'aura', 'ate girl', 'lowkey', 'no notes', 'fr fr', 'ick', 'core', 'real', 'slay'). Max 3 short lines. 1-2 emojis. Ends with casual CTA ('dm na ate', 'reserve mo na bestie').",
    example:
      "adobo core fr 😭 the aura of this batch is unmatched lowkey. dm na bestie before maubos.",
    audience: "Gen Z buyers (18-26)",
    freshness: "Hot right now",
    outputShape: "single",
  },
  {
    id: "tita-long",
    name: "Tita-friendly long caption",
    description:
      "Warm, story-driven, emoji-rich long caption. Performs well with Tita demographic on FB.",
    format:
      "Single long caption (5-8 sentences). Warm storytelling open, family/values angle, generous emojis (❤️🥰😋🍲). Multiple line breaks for readability. Clear CTA at the end with contact details cue.",
    example:
      "Good morning po mga ka-Lutuin! 🥰 Today is special kasi gagawin ko ulit yung kare-kare na paborito ng nanay ko... ❤️ Message niyo na po ako para ma-reserve ang slot ninyo.",
    audience: "Titas, lolas, family-oriented buyers",
    freshness: "Steady favorite",
    outputShape: "single",
  },
  {
    id: "reel-hook",
    name: "Reel-style stop-scroll hook",
    description:
      "Caption styled like a Reels/short video hook — punchy first line designed to stop the thumb.",
    format:
      "Single caption. First line is a 4-8 word stop-scroll hook ('Stop scrolling kung gutom ka.', 'Wag mo to i-swipe.'). Then 2-3 lines of payoff. End with CTA.",
    example:
      "Stop scrolling kung gutom ka. 🛑 Fresh batch ng kare-kare, may bagoong galing Pampanga. Limited slots this Sunday — message us.",
    audience: "FB + IG short-form viewers",
    freshness: "Hot",
    outputShape: "single",
  },
];

function pickTrendForBrand(tone: string, contentType: string): Trend {
  // Lightweight heuristic auto-pick. Edge function side, no extra LLM call.
  const t = tone.toLowerCase();
  if (contentType === "reel") return TRENDS.find((x) => x.id === "reel-hook")!;
  if (t.includes("funny")) return TRENDS.find((x) => x.id === "walang-basagan")!;
  if (t.includes("urgent")) return TRENDS.find((x) => x.id === "carousel-hook")!;
  // Default to the most shareable trend right now
  return TRENDS.find((x) => x.id === "mil-vs-genz")!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const {
      product,
      tone,
      contentType,
      brand,
      trendMode,
      trendId,
      uploadedImage,
      imageAction,
    }: {
      product: string;
      tone: string;
      contentType: string;
      brand: {
        businessName: string;
        oneLiner: string;
        brandVoice: string;
        photographyMood: string;
        visualStyle: string;
        palette: string[];
      };
      trendMode?: boolean;
      trendId?: string;
      uploadedImage?: string | null;
      imageAction?: string;
    } = await req.json();

    if (!product || product.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Product description is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Resolve trend (if any)
    let chosenTrend: Trend | null = null;
    if (trendMode) {
      if (trendId && trendId !== "auto") {
        chosenTrend = TRENDS.find((t) => t.id === trendId) ?? pickTrendForBrand(tone, contentType);
      } else {
        chosenTrend = pickTrendForBrand(tone, contentType);
      }
    }

    // Build messages + tool schema based on mode
    const baseSystem =
      "You are a Filipino food-seller marketing copywriter. Write in warm, natural Taglish suited for Facebook posts. Be specific, concise, and end with a clear call to action.";

    let systemPrompt = baseSystem;
    let userPrompt = `Brand: ${brand.businessName}
One-liner: ${brand.oneLiner}
Voice: ${brand.brandVoice}
Tone: ${tone}
Content type: ${contentType}
Product / offer: ${product}

Generate 3 distinct caption angles (Story hook, Problem-solution, FOMO/social proof) and one short posting tip.`;

    let toolSchema: Record<string, unknown> = {
      type: "object",
      properties: {
        captions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              text: { type: "string" },
            },
            required: ["label", "text"],
          },
          minItems: 3,
          maxItems: 3,
        },
        tip: { type: "string" },
        photoTip: { type: "string" },
      },
      required: ["captions", "tip", "photoTip"],
      additionalProperties: false,
    };

    if (chosenTrend) {
      systemPrompt = `${baseSystem}

You are also a current-trends expert for Filipino Facebook content. Apply the trend below FAITHFULLY. Match its voice, structure, and energy — do NOT default to generic captions.

TREND: ${chosenTrend.name}
WHY IT'S HOT: ${chosenTrend.description}
FORMAT RULES: ${chosenTrend.format}
TARGET AUDIENCE: ${chosenTrend.audience}
EXAMPLE (for style only, do not copy):
${chosenTrend.example}`;

      if (chosenTrend.outputShape === "dual") {
        userPrompt = `Brand: ${brand.businessName}
One-liner: ${brand.oneLiner}
Voice: ${brand.brandVoice}
Tone: ${tone}
Content type: ${contentType}
Product / offer: ${product}

Apply the "${chosenTrend.name}" trend. Generate exactly 2 captions for the SAME image, labeled per the trend's format rules. Also return one short posting tip and one photo tip.`;

        toolSchema = {
          type: "object",
          properties: {
            captions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  text: { type: "string" },
                },
                required: ["label", "text"],
              },
              minItems: 2,
              maxItems: 2,
            },
            tip: { type: "string" },
            photoTip: { type: "string" },
          },
          required: ["captions", "tip", "photoTip"],
          additionalProperties: false,
        };
      } else {
        userPrompt = `Brand: ${brand.businessName}
One-liner: ${brand.oneLiner}
Voice: ${brand.brandVoice}
Tone: ${tone}
Content type: ${contentType}
Product / offer: ${product}

Apply the "${chosenTrend.name}" trend. Generate 3 caption variations that all follow the trend's format rules (different angles, same trend voice). Also return one short posting tip and one photo tip.`;
      }
    }

    const textPayload = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_captions",
            description: "Return caption options and a posting tip",
            parameters: toolSchema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_captions" } },
    };

    const imagePrompt = `Photorealistic hero food photograph of ${product}. Filipino home cooking style. ${brand.photographyMood} Visual style: ${brand.visualStyle}. Natural window light, shallow depth of field, 50mm lens, appetizing steam, authentic textures, real ceramic plate on rustic wood or banana leaf, warm color grading. No text, no logos, no watermarks. Editorial food photography quality.`;

    // Build image payload based on what the client sent
    const skipImageGen = imageAction === "use-direct";
    const imagePayload = skipImageGen ? null : imageAction === "enhance" && uploadedImage
      ? {
          model: "google/gemini-2.5-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: uploadedImage } },
              { type: "text", text: `Enhance this food photo for a Filipino home-based food brand. Photography mood: ${brand.photographyMood}. Visual style: ${brand.visualStyle}. Improve the lighting, color grading, and overall composition to look professional and appetizing. Preserve the same dish and subject. No text overlays, no logos, no watermarks.` },
            ],
          }],
          modalities: ["image", "text"],
        }
      : {
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        };

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    };

    const aiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const results = await Promise.all([
      fetch(aiUrl, { method: "POST", headers, body: JSON.stringify(textPayload) }),
      imagePayload
        ? fetch(aiUrl, { method: "POST", headers, body: JSON.stringify(imagePayload) })
        : Promise.resolve(null),
    ]);
    const textRes = results[0] as Response;
    const imageRes = results[1] as Response | null;

    if (textRes.status === 429 || imageRes?.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (textRes.status === 402 || imageRes?.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add credits in your workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!textRes.ok) {
      const t = await textRes.text();
      console.error("Text gen failed:", textRes.status, t);
      throw new Error("Text generation failed");
    }
    if (imageRes && !imageRes.ok) {
      const t = await imageRes.text();
      console.error("Image gen failed:", imageRes.status, t);
    }

    const textJson = await textRes.json();
    const toolCall = textJson.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: { captions: { label: string; text: string }[]; tip: string; photoTip: string } = {
      captions: [],
      tip: "",
      photoTip: "",
    };
    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    let imageUrl = "";
    if (imageRes?.ok) {
      const imgJson = await imageRes.json();
      imageUrl = imgJson.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? "";
    }

    return new Response(
      JSON.stringify({
        captions: parsed.captions,
        tip: parsed.tip,
        photoTip: parsed.photoTip,
        imagePrompt,
        imageUrl,
        trend: chosenTrend
          ? {
              id: chosenTrend.id,
              name: chosenTrend.name,
              description: chosenTrend.description,
              freshness: chosenTrend.freshness,
              audience: chosenTrend.audience,
            }
          : null,
        availableTrends: TRENDS.map((t) => ({
          id: t.id,
          name: t.name,
          freshness: t.freshness,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-content error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
