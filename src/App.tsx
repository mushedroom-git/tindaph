import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "noir";
type Page = "news" | "home" | "brand" | "content" | "convert" | "outcomes";
type NewsCategory = "msme" | "facebook" | "food" | "gov";

type NewsItem = {
  id: number;
  category: NewsCategory;
  categoryLabel: string;
  headline: string;
  summary: string;
  tags: string[];
};

type VibeOption = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
};

type VisualStyleOption = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
};

type PaletteColor = {
  name: string;
  role: string;
  hex: string;
};

type PalettePack = {
  photographyMood: string;
  colors: PaletteColor[];
};

type ContentType = "caption" | "story" | "description" | "reel";

type CaptionOption = {
  label: string;
  text: string;
};

type ContentResult = {
  captions: CaptionOption[];
  tip: string;
  imagePrompt: string;
  photoTip: string;
};

type SituationId = "magkano" | "ghost" | "discount" | "firsttime" | "close" | "complaint";

type ScriptResult = {
  script: string;
  why: string;
  avoid: string;
};

type OutcomeType = "caption" | "script";
type OutcomeFeedback = "yes" | "dm" | "no";

type OutcomeItem = {
  id: number;
  type: OutcomeType;
  preview: string;
  status: "pending" | "logged";
  feedback?: OutcomeFeedback;
  context?: string;
  createdAt: string;
};

type BrandProfile = {
  businessName: string;
  tagline: string;
  oneLiner: string;
  targetBuyer: string;
  uniqueValue: string;
  brandVoice: string;
  emotionalHook: string;
  contentTip: string;
  palette: PaletteColor[];
  photographyMood: string;
};

const pageMeta: Record<Page, [string, string]> = {
  news: ["Trending Now", "What's hot in Philippine food selling"],
  home: ["Dashboard", "Your brand knowledge platform"],
  brand: ["Brand Builder", "Build your positioning and story"],
  content: ["Content Engine", "Generate captions in your voice"],
  convert: ["Conversion Kit", "Scripts for high-intent conversations"],
  outcomes: ["Outcomes Tracker", "Log what converted into orders"],
};

const newsItems: NewsItem[] = [
  {
    id: 1,
    category: "food",
    categoryLabel: "Food trends",
    headline: "Lutong bahay combos are outperforming premium single dishes",
    summary:
      "Bundle posts using ulam + side + delivery windows are gaining stronger saves and DMs than single-item offers in Metro Manila seller groups.",
    tags: ["Bundle strategy", "Price framing"],
  },
  {
    id: 2,
    category: "facebook",
    categoryLabel: "Facebook selling",
    headline: "Comment-first CTAs are boosting reach more than pure 'PM now' copy",
    summary:
      "Sellers asking one specific question in captions are seeing longer thread depth, which translates to more profile visits and message starts.",
    tags: ["Engagement", "Organic reach"],
  },
  {
    id: 3,
    category: "msme",
    categoryLabel: "MSME news",
    headline: "Weekend micro-popups remain strong for home-based food brands",
    summary:
      "Community markets in Makati and Pasig continue favoring sellers with pre-order forms and limited slots posted 48 hours before event day.",
    tags: ["Pop-up prep", "Pre-orders"],
  },
  {
    id: 4,
    category: "gov",
    categoryLabel: "Government programs",
    headline: "City-level business clinics open new slots for micro food entrepreneurs",
    summary:
      "Local LGU support programs now include short modules on compliance, costing, and digital selling basics for home kitchen operators.",
    tags: ["Compliance", "Free training"],
  },
];

const navItems: Array<{ page: Page; label: string; icon: string; comingSoon?: boolean }> = [
  { page: "news", label: "Trending Now", icon: "◐" },
  { page: "home", label: "Dashboard", icon: "◈" },
  { page: "brand", label: "Brand Builder", icon: "◇" },
  { page: "content", label: "Content Engine", icon: "✦" },
  { page: "convert", label: "Conversion Kit", icon: "◎" },
  { page: "outcomes", label: "Outcomes Tracker", icon: "◉", comingSoon: true },
];

const vibeOptions: VibeOption[] = [
  {
    id: "Warm & homey",
    emoji: "🏠",
    name: "Warm & homey",
    desc: "Nurturing, comforting, trustworthy - like cooking for family",
  },
  {
    id: "Fun & exciting",
    emoji: "🎉",
    name: "Fun & exciting",
    desc: "Energetic, playful, bold - always something new",
  },
  {
    id: "Reliable & consistent",
    emoji: "🏆",
    name: "Reliable & consistent",
    desc: "Dependable, quality-first - buyers know what they get",
  },
  {
    id: "Passionate & crafted",
    emoji: "👨‍🍳",
    name: "Passionate & crafted",
    desc: "Artisanal, proud, serious - every detail matters",
  },
];

const visualStyles: VisualStyleOption[] = [
  {
    id: "homey",
    emoji: "🌿",
    name: "Homey & natural",
    desc: "Warm earth tones, natural light - feels like lola's kitchen",
  },
  {
    id: "premium",
    emoji: "✨",
    name: "Clean & premium",
    desc: "White backgrounds, sharp detail - upscale and aspirational",
  },
  {
    id: "bold",
    emoji: "🎉",
    name: "Bold & vibrant",
    desc: "Rich colors, generous portions - abundant and irresistible",
  },
  {
    id: "story",
    emoji: "📖",
    name: "Story-driven",
    desc: "People, hands, process - shows the maker, not just food",
  },
];

const palettesByVisualStyle: Record<string, PalettePack> = {
  homey: {
    photographyMood:
      "Natural window light, wooden textures, and soft steam-forward close-ups that feel like home cooking at lola's table.",
    colors: [
      { name: "Sinigang Clay", role: "Primary", hex: "#8F5D3B" },
      { name: "Banana Leaf", role: "Secondary", hex: "#5E7A4D" },
      { name: "Calamansi Cream", role: "Background", hex: "#F6EFD9" },
      { name: "Bagoong Deep", role: "Accent", hex: "#6B3B2A" },
    ],
  },
  premium: {
    photographyMood:
      "Clean overhead framing with bright white surfaces, minimal props, crisp shadows, and polished plating details.",
    colors: [
      { name: "Porcelain", role: "Background", hex: "#F8FAFC" },
      { name: "Slate", role: "Primary", hex: "#1F2937" },
      { name: "Gold Foil", role: "Accent", hex: "#C8A24D" },
      { name: "Miso Beige", role: "Secondary", hex: "#D7C5A8" },
    ],
  },
  bold: {
    photographyMood:
      "Saturated contrast, richer plating tones, and energetic compositions that make portions feel abundant and irresistible.",
    colors: [
      { name: "Chili Red", role: "Primary", hex: "#C92A2A" },
      { name: "Turmeric", role: "Secondary", hex: "#F59F00" },
      { name: "Ube Pop", role: "Accent", hex: "#7B5EA7" },
      { name: "Charcoal", role: "Neutral", hex: "#2B2D42" },
    ],
  },
  story: {
    photographyMood:
      "Documentary-style scenes with hands, prep moments, and lived-in kitchen details that spotlight the maker behind each dish.",
    colors: [
      { name: "Apron Denim", role: "Primary", hex: "#3F5E7A" },
      { name: "Palay Husk", role: "Secondary", hex: "#B08D57" },
      { name: "Morning Rice", role: "Background", hex: "#F3EFE6" },
      { name: "Kawali Black", role: "Accent", hex: "#2A2A2A" },
    ],
  },
};

function summarize(text: string, max = 130) {
  const clean = text.trim();
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max - 1).trim()}...`;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function suggestBusinessName(product: string, vibe: string) {
  const lower = product.toLowerCase();
  if (lower.includes("adobo")) {
    return "Adobo at Iba Pa";
  }
  if (lower.includes("sinigang")) {
    return "Sinigang Stories";
  }
  if (lower.includes("kare-kare")) {
    return "Kare Kare Corner";
  }
  if (vibe.includes("Warm")) {
    return "Kusina ni Maria";
  }
  if (vibe.includes("Reliable")) {
    return "Daily Ulam Co.";
  }
  return "Lutong Bahay ni Maria";
}

function generateBrandProfile(
  form: {
    product: string;
    buyer: string;
    diff: string;
    why: string;
    vibe: string;
    surprise: string;
    businessName: string;
    visualStyle: string;
  },
  palette: PalettePack
): BrandProfile {
  const businessName = form.businessName.trim() || suggestBusinessName(form.product, form.vibe);
  const conciseBuyer = summarize(form.buyer, 180);
  const conciseDiff = summarize(form.diff, 150);
  const conciseWhy = summarize(form.why, 170);

  return {
    businessName,
    tagline: summarize(`${form.vibe} Filipino comfort food, delivered fresh`, 58),
    oneLiner: summarize(`${businessName} serves ${conciseBuyer} with ${conciseDiff.toLowerCase()}`, 180),
    targetBuyer: conciseBuyer,
    uniqueValue: conciseDiff,
    brandVoice: summarize(form.vibe.replace("&", ","), 42),
    emotionalHook: conciseWhy,
    contentTip: summarize(
      `Use your customer surprise in short story hooks and end with one clear question to invite replies: ${form.surprise}`,
      180
    ),
    palette: palette.colors,
    photographyMood: palette.photographyMood,
  };
}

function toDataUriSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function App() {
  const [theme, setTheme] = useState<Theme>("noir");
  const [page, setPage] = useState<Page>("news");
  const [newsFilter, setNewsFilter] = useState<"all" | NewsCategory>("all");
  const [brandSaved, setBrandSaved] = useState(false);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [postsGenerated, setPostsGenerated] = useState(0);
  const [scriptsGenerated, setScriptsGenerated] = useState(0);
  const [brandForm, setBrandForm] = useState({
    product:
      "Homemade lutong ulam - adobo, sinigang, kare-kare. Good for 2-4 persons. Delivering in Makati and BGC area.",
    buyer:
      "Busy moms and young professionals in BGC who miss home-cooked Filipino food but have no time to cook after work.",
    diff: "Others use shortcuts and MSG. I use lola's recipes passed 3 generations - everything cooked fresh that morning, no shortcuts.",
    why: "When my husband lost his job, I needed to do something. My lola always cooked for everyone during hard times. This was my way of doing the same.",
    vibe: "Warm & homey",
    surprise: "They always say it tastes exactly like their own lola's cooking. One buyer cried the first time she tried my sinigang.",
    businessName: "Lola's Lutuin",
    visualStyle: "homey",
  });
  const [contentProduct, setContentProduct] = useState(
    "Beef kare-kare with homemade bagoong - P420 for 3-4 persons. Available this Sunday only. Limited slots."
  );
  const [contentTone, setContentTone] = useState("Warm + personal");
  const [contentType, setContentType] = useState<ContentType>("caption");
  const [contentLoading, setContentLoading] = useState(false);
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);
  const [genMode, setGenMode] = useState<"ai" | "tip">("ai");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [situation, setSituation] = useState<SituationId>("magkano");
  const [convertContext, setConvertContext] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null);
  const [outcomes, setOutcomes] = useState<OutcomeItem[]>([]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const visibleNews = useMemo(() => {
    if (newsFilter === "all") {
      return newsItems;
    }
    return newsItems.filter((item) => item.category === newsFilter);
  }, [newsFilter]);

  const selectedPalette = palettesByVisualStyle[brandForm.visualStyle] ?? palettesByVisualStyle.homey;
  const computedProfile = useMemo(() => generateBrandProfile(brandForm, selectedPalette), [brandForm, selectedPalette]);
  const activeBrandProfile = brandSaved && brandProfile ? brandProfile : computedProfile;
  const pendingOutcomes = outcomes.filter((item) => item.status === "pending");
  const loggedOutcomes = outcomes.filter((item) => item.status === "logged");
  const yesCount = loggedOutcomes.filter((item) => item.feedback === "yes").length;
  const dmCount = loggedOutcomes.filter((item) => item.feedback === "dm").length;
  const noCount = loggedOutcomes.filter((item) => item.feedback === "no").length;
  const successfulCaptionCount = loggedOutcomes.filter((item) => item.type === "caption" && item.feedback === "yes").length;
  const successfulScriptCount = loggedOutcomes.filter((item) => item.type === "script" && item.feedback === "yes").length;
  const patternInsights = [
    successfulCaptionCount > 0
      ? `Content posts converted ${successfulCaptionCount} time${successfulCaptionCount > 1 ? "s" : ""} - keep testing visual hooks.`
      : "",
    successfulScriptCount > 0
      ? `DM scripts led to orders ${successfulScriptCount} time${successfulScriptCount > 1 ? "s" : ""} - Conversion Kit is working.`
      : "",
    dmCount > 0
      ? `${dmCount} outcome${dmCount > 1 ? "s" : ""} reached DM stage - follow-up timing can push these to orders.`
      : "",
  ].filter(Boolean);

  const previewName = brandForm.businessName.trim() || "Your Business Name";
  const previewOneLiner = activeBrandProfile.oneLiner;
  const previewPrimary = activeBrandProfile.palette[0]?.hex ?? "#7B5EA7";
  const previewSecondary = activeBrandProfile.palette[1]?.hex ?? "#5E7A4D";
  const previewBackground = activeBrandProfile.palette[2]?.hex ?? "#F8F5FF";

  function updateBrandField<K extends keyof typeof brandForm>(key: K, value: (typeof brandForm)[K]) {
    setBrandForm((prev) => ({ ...prev, [key]: value }));
    if (brandSaved) {
      setBrandSaved(false);
    }
  }

  function handleBuildBrandProfile() {
    const generated = generateBrandProfile(brandForm, selectedPalette);
    setBrandProfile(generated);
    setBrandSaved(true);
  }

  function addPendingOutcome(type: OutcomeType, text: string, context?: string) {
    setOutcomes((prev) => [
      {
        id: prev.length + 1,
        type,
        preview: summarize(text, 170),
        status: "pending",
        context,
        createdAt: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  }

  function logOutcome(id: number, feedback: OutcomeFeedback) {
    setOutcomes((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "logged",
              feedback,
            }
          : item
      )
    );
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // noop
    }
  }

  function generateContentResult(product: string): ContentResult {
    const intro = activeBrandProfile.businessName;
    const oneLiner = activeBrandProfile.oneLiner;
    const cta = "Message us now to reserve your slot today.";
    const captions: CaptionOption[] = [
      {
        label: "Story hook",
        text: `${intro} check-in: ${product}\n\nIf you're craving lutong bahay after a long day, this one is for you. ${cta}`,
      },
      {
        label: "Problem-solution",
        text: `No time to cook but gusto mo pa rin ng tunay na lutong bahay? ${oneLiner}\n\nToday: ${product}. ${cta}`,
      },
      {
        label: "FOMO / social proof",
        text: `Our repeat buyers keep asking for this: ${product}.\n\nLimited batches lang every release. ${cta}`,
      },
    ];

    return {
      captions,
      tip: `Post Option 1 first while your audience is active, then pin Option 2 in comments to answer common objections quickly.`,
      imagePrompt: `Hero shot of ${product}. Style: ${visualStyles.find((s) => s.id === brandForm.visualStyle)?.name}. Use ${activeBrandProfile.photographyMood} Include steam, plated close-up, and natural props aligned to the palette (${activeBrandProfile.palette.map((p) => p.hex).join(", ")}).`,
      photoTip: `Shoot near a window at 45 degrees, place the dish on a neutral plate, and add one prop (spoon or banana leaf) to show scale and warmth.`,
    };
  }

  function generateImagePreview(promptText: string) {
    const p0 = activeBrandProfile.palette[0]?.hex ?? "#7B5EA7";
    const p1 = activeBrandProfile.palette[1]?.hex ?? "#5E7A4D";
    const p2 = activeBrandProfile.palette[2]?.hex ?? "#F6EFD9";
    const title = summarize(promptText, 48).replace(/[&<>"']/g, "");

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='520'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${p0}'/>
          <stop offset='55%' stop-color='${p1}'/>
          <stop offset='100%' stop-color='${p2}'/>
        </linearGradient>
      </defs>
      <rect width='900' height='520' fill='url(#g)'/>
      <circle cx='200' cy='170' r='120' fill='rgba(255,255,255,0.16)'/>
      <circle cx='670' cy='310' r='170' fill='rgba(255,255,255,0.12)'/>
      <rect x='70' y='370' width='760' height='90' rx='16' fill='rgba(0,0,0,0.28)'/>
      <text x='90' y='420' fill='white' font-size='28' font-family='Plus Jakarta Sans, Arial'>${title}</text>
    </svg>`;

    setGeneratedImage(toDataUriSvg(svg));
  }

  function handleGenerateContent() {
    const product = contentProduct.trim();
    if (!product) {
      window.alert("Please describe what you are posting about.");
      return;
    }

    setContentLoading(true);
    const result = generateContentResult(product);
    setContentResult(result);
    setGeneratedImage("");
    setPostsGenerated((prev) => prev + 3);
    addPendingOutcome("caption", result.captions[0].text, contentType);
    setContentLoading(false);
  }

  function generateScriptResult(currentSituation: SituationId, extraContext: string): ScriptResult {
    const situationalOpeners: Record<SituationId, string> = {
      magkano: `Hi po! Salamat sa interest ninyo sa ${activeBrandProfile.businessName}.`,
      ghost: `Hi po, quick follow-up lang regarding your order inquiry.`,
      discount: `Hi po! Salamat sa message and sa support sa small business namin.`,
      firsttime: `Welcome po! Thanks for checking us out for the first time.`,
      close: `Perfect po, we can reserve your slot today.`,
      complaint: `Hi po, thank you for raising this and sorry sa experience ninyo.`,
    };

    const actionLine: Record<SituationId, string> = {
      magkano: `For today's batch, we offer portions good for 2-4 at fair pricing dahil fresh and lutong bahay bawat order.`,
      ghost: `If timing was the issue, we can hold your preferred slot for a few hours so you can decide without pressure.`,
      discount: `Instead of reducing quality, I can suggest the best value option that still matches your budget.`,
      firsttime: `Most first-time buyers start with our bestseller para safe and sulit sa first order.`,
      close: `If okay na po, I can lock your slot now and send exact delivery window agad.`,
      complaint: `I want to make this right today and offer a clear resolution that works for you.`,
    };

    const closer: Record<SituationId, string> = {
      magkano: `Would you like me to send today's exact menu and available delivery slots?`,
      ghost: `Would you like me to reopen your slot for today or tomorrow?`,
      discount: `Want me to show 2 sulit options now so you can choose quickly?`,
      firsttime: `Would you like me to recommend the easiest first order combo for you?`,
      close: `Shall I confirm your order details now?`,
      complaint: `Can I confirm your preferred fix so I can process it right away?`,
    };

    const contextLine = extraContext.trim() ? `Noted context: ${summarize(extraContext, 90)}.` : "";

    return {
      script: `${situationalOpeners[currentSituation]} ${actionLine[currentSituation]} ${contextLine} ${closer[currentSituation]}`.trim(),
      why: `This script validates the buyer's concern first, then reframes around value and low-friction next steps. It keeps the tone warm and specific, which increases reply likelihood without sounding pushy.`,
      avoid: `Avoid one-line pressure like "Order now or maubos." It can trigger resistance and make hesitant buyers disengage.`,
    };
  }

  function handleGenerateScript() {
    setConvertLoading(true);
    const result = generateScriptResult(situation, convertContext);
    setScriptResult(result);
    setScriptsGenerated((prev) => prev + 1);
    addPendingOutcome("script", result.script, situation);
    setConvertLoading(false);
  }

  return (
    <>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo-row">
              <div className="brand-icon">●</div>
              <div className="brand-wordmark">
                Tinda<span>.</span>ph
              </div>
            </div>
            <div className="brand-sub">Beta · Knowledge Platform</div>
          </div>

          <div className="user-chip">
            <div className="user-avatar">M</div>
            <div>
              <div className="user-name">Maria Lim</div>
              <div className="user-role">Home-based food seller</div>
            </div>
          </div>

          <div className="nav">
            <div className="nav-group-label">Platform</div>
            {navItems.map((item) => (
              <button
                key={item.page}
                className={page === item.page ? "nav-btn active" : "nav-btn"}
                onClick={() => setPage(item.page)}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.comingSoon && <span className="nav-badge">Beta</span>}
              </button>
            ))}
          </div>

          <div className="sidebar-foot">
            Powered by AI
            <br />
            Built for Filipino sellers
            <br />
            Tinda.ph · v0.1 Beta
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <span className="topbar-page">{pageMeta[page][0]}</span>
              <span className="topbar-sep">·</span>
              <span className="topbar-crumb">{pageMeta[page][1]}</span>
            </div>
            <div className="topbar-right">
              <div className="ai-pill">
                <div className="ai-dot" /> AI Ready
              </div>
            </div>
          </div>

          <div className="body">
            <div className="content-area">
              <section className={page === "news" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Trending Now · Live feed
                  </div>
                  <div className="page-title">
                    Magandang umaga,<br />
                    <em>Maria.</em>
                  </div>
                  <div className="page-sub">Here's what's moving in Philippine food selling today.</div>
                </div>

                <div className="news-filters">
                  <button
                    className={newsFilter === "all" ? "tone-pill on" : "tone-pill"}
                    onClick={() => setNewsFilter("all")}
                    type="button"
                  >
                    All topics
                  </button>
                  <button
                    className={newsFilter === "msme" ? "tone-pill on" : "tone-pill"}
                    onClick={() => setNewsFilter("msme")}
                    type="button"
                  >
                    MSME news
                  </button>
                  <button
                    className={newsFilter === "facebook" ? "tone-pill on" : "tone-pill"}
                    onClick={() => setNewsFilter("facebook")}
                    type="button"
                  >
                    Facebook selling
                  </button>
                  <button
                    className={newsFilter === "food" ? "tone-pill on" : "tone-pill"}
                    onClick={() => setNewsFilter("food")}
                    type="button"
                  >
                    Food trends
                  </button>
                  <button
                    className={newsFilter === "gov" ? "tone-pill on" : "tone-pill"}
                    onClick={() => setNewsFilter("gov")}
                    type="button"
                  >
                    Government programs
                  </button>
                </div>

                {visibleNews.map((item) => (
                  <article className="news-card" key={item.id}>
                    <div className="news-card-top">
                      <span className={`news-category cat-${item.category}`}>{item.categoryLabel}</span>
                    </div>
                    <div className="news-headline">{item.headline}</div>
                    <div className="news-summary">{item.summary}</div>
                    <div>
                      {item.tags.map((tag) => (
                        <span className="news-trend-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="news-action">Turn into a post idea →</div>
                  </article>
                ))}
              </section>

              <section className={page === "home" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Dashboard
                  </div>
                  <div className="page-title">
                    Magandang umaga,<br />
                    <em>Maria.</em>
                  </div>
                  <div className="page-sub">Your brand knowledge platform. What do you need today?</div>
                </div>

                <div className="stat-row">
                  <div className="stat-card">
                    <div className="stat-icon-wrap">◇</div>
                    <div>
                      <div className="stat-num">{brandSaved ? "Ready" : "-"}</div>
                      <div className="stat-lbl">Brand profile</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap">✦</div>
                    <div>
                      <div className="stat-num">{postsGenerated}</div>
                      <div className="stat-lbl">Posts generated</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap">◎</div>
                    <div>
                      <div className="stat-num">{scriptsGenerated}</div>
                      <div className="stat-lbl">Scripts used</div>
                    </div>
                  </div>
                </div>

                <div className="dash-grid">
                  <article className="dash-card" onClick={() => setPage("brand")}>
                    <div className="dash-card-ic">◇</div>
                    <div className="dash-card-arrow">↗</div>
                    <div className="dash-card-title">Brand Builder</div>
                    <div className="dash-card-sub">Set your foundation once. Powers everything.</div>
                  </article>
                  <article className="dash-card" onClick={() => setPage("content")}>
                    <div className="dash-card-ic">✦</div>
                    <div className="dash-card-arrow">↗</div>
                    <div className="dash-card-title">Content Engine</div>
                    <div className="dash-card-sub">Generate captions in your voice.</div>
                  </article>
                  <article className="dash-card" onClick={() => setPage("convert")}>
                    <div className="dash-card-ic">◎</div>
                    <div className="dash-card-arrow">↗</div>
                    <div className="dash-card-title">Conversion Kit</div>
                    <div className="dash-card-sub">The right words for every buyer situation.</div>
                  </article>
                </div>

                <div className="tip-banner">
                  <div className="tip-banner-icon">💡</div>
                  <div>
                    <div className="tip-banner-label">Tip of the day</div>
                    <div className="tip-banner-text">
                      Posts ending with a question get <strong>3x more comments</strong> on Facebook. Try closing with
                      <strong> "Gusto mo bang subukan?"</strong> and reply fast to each comment.
                    </div>
                  </div>
                </div>
              </section>

              <section className={page === "brand" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Brand Builder · Module 1
                  </div>
                  <div className="page-title">
                    Build your<br />
                    <em>brand foundation.</em>
                  </div>
                  <div className="page-sub">Six questions. Your AI builds a complete brand profile used in every caption and script.</div>
                </div>

                {brandSaved && (
                  <div className="banner banner-success show">Brand profile saved - all content is now personalized to your business.</div>
                )}

                <div className="card mb-3">
                  <div className="card-eyebrow">Your product</div>
                  <div className="card-title">What you sell and who you serve</div>

                  <div className="field">
                    <div className="field-label">
                      <span className="step-num">1</span> What do you sell and where do you deliver?
                    </div>
                    <div className="field-hint">Be specific - product, portion, delivery area.</div>
                    <textarea
                      rows={2}
                      value={brandForm.product}
                      onChange={(e) => updateBrandField("product", e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <div className="field-label">
                      <span className="step-num">2</span> Who is your ideal customer and what is their problem before they find you?
                    </div>
                    <div className="field-hint">Think about the situation they are in before they order.</div>
                    <textarea rows={2} value={brandForm.buyer} onChange={(e) => updateBrandField("buyer", e.target.value)} />
                  </div>

                  <div className="field mb-0">
                    <div className="field-label">
                      <span className="step-num">3</span> What do other sellers offer and what do you do differently?
                    </div>
                    <div className="field-hint">"Mas masarap" is not enough. What exactly makes yours different?</div>
                    <textarea rows={2} value={brandForm.diff} onChange={(e) => updateBrandField("diff", e.target.value)} />
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-eyebrow">Your story and voice</div>
                  <div className="card-title">What makes your brand human</div>

                  <div className="field">
                    <div className="field-label">
                      <span className="step-num">4</span> Why did you really start this business?
                    </div>
                    <div className="field-hint">This becomes your most powerful content. Dig deeper than "para kumita."</div>
                    <textarea rows={2} value={brandForm.why} onChange={(e) => updateBrandField("why", e.target.value)} />
                  </div>

                  <div className="field">
                    <div className="field-label">
                      <span className="step-num">5</span> How would you describe your vibe as a seller?
                    </div>
                    <div className="pill-grid">
                      {vibeOptions.map((vibe) => (
                        <button
                          className={brandForm.vibe === vibe.id ? "pill-opt on" : "pill-opt"}
                          key={vibe.id}
                          onClick={() => updateBrandField("vibe", vibe.id)}
                          type="button"
                        >
                          <span className="pill-emoji">{vibe.emoji}</span>
                          <span className="pill-name">{vibe.name}</span>
                          <span className="pill-desc">{vibe.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field mb-0">
                    <div className="field-label">
                      <span className="step-num">6</span> What do your best customers say that surprises you?
                    </div>
                    <div className="field-hint">What do buyers notice that you did not expect them to care about?</div>
                    <textarea
                      rows={2}
                      value={brandForm.surprise}
                      onChange={(e) => updateBrandField("surprise", e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="field-label">
                    Business name <span className="field-optional">(leave blank for a suggestion)</span>
                  </div>
                  <input
                    type="text"
                    value={brandForm.businessName}
                    onChange={(e) => updateBrandField("businessName", e.target.value)}
                    placeholder="e.g. Lola's Lutuin, Maria's Kitchen..."
                  />
                </div>

                <div className="card mb-3">
                  <div className="card-eyebrow">Visual identity</div>
                  <div className="card-title">How should your food look to buyers?</div>
                  <div className="field mb-0">
                    <div className="field-label">
                      <span className="step-num">7</span> Pick your visual style
                    </div>
                    <div className="field-hint">This shapes your brand color palette and generated image direction.</div>
                    <div className="vstyle-grid">
                      {visualStyles.map((style) => (
                        <button
                          className={brandForm.visualStyle === style.id ? "vstyle-opt on" : "vstyle-opt"}
                          key={style.id}
                          onClick={() => updateBrandField("visualStyle", style.id)}
                          type="button"
                        >
                          <span className="vstyle-emoji">{style.emoji}</span>
                          <span className="vstyle-name">{style.name}</span>
                          <span className="vstyle-desc">{style.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary btn-full" onClick={handleBuildBrandProfile} type="button">
                  Build my brand profile + color palette
                </button>

                {brandSaved && (
                  <div className="output show">
                    <hr className="divider" />
                    <div className="output-label">Your brand profile</div>
                    <div className="palette-box show">
                      <div className="palette-box-label">Your brand color palette</div>
                      <div className="palette-strip">
                        {activeBrandProfile.palette.map((color) => (
                          <div className="palette-swatch-wrap" key={`${color.role}-${color.hex}`}>
                            <div className="palette-swatch" style={{ background: color.hex }} title={color.name} />
                            <div className="palette-role">{color.role}</div>
                            <div className="palette-hex">{color.hex}</div>
                          </div>
                        ))}
                      </div>
                      <div className="palette-mood">{activeBrandProfile.photographyMood}</div>
                    </div>
                    <div className="profile-grid">
                      <div className="pf hero span2">
                        <div className="pf-label">Business name</div>
                        <div className="pf-value">{activeBrandProfile.businessName}</div>
                        <div className="pf-tagline">"{activeBrandProfile.tagline}"</div>
                      </div>
                      <div className="pf span2">
                        <div className="pf-label">One-liner</div>
                        <div className="pf-value">{activeBrandProfile.oneLiner}</div>
                      </div>
                      <div className="pf">
                        <div className="pf-label">Target buyer</div>
                        <div className="pf-value">{activeBrandProfile.targetBuyer}</div>
                      </div>
                      <div className="pf">
                        <div className="pf-label">Differentiator</div>
                        <div className="pf-value">{activeBrandProfile.uniqueValue}</div>
                      </div>
                      <div className="pf">
                        <div className="pf-label">Brand voice</div>
                        <div className="pf-value">{activeBrandProfile.brandVoice}</div>
                      </div>
                      <div className="pf span2">
                        <div className="pf-label">Founder story</div>
                        <div className="pf-value">{activeBrandProfile.emotionalHook}</div>
                      </div>
                      <div className="pf span2">
                        <div className="pf-label">Content tip</div>
                        <div className="pf-value">{activeBrandProfile.contentTip}</div>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-full" onClick={() => setPage("content")} style={{ marginTop: 12 }} type="button">
                      Now generate your first posts
                    </button>
                  </div>
                )}
              </section>

              <section className={page === "content" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Content Engine · Module 2
                  </div>
                  <div className="page-title">
                    Generate posts<br />
                    <em>in your voice.</em>
                  </div>
                  <div className="page-sub">Tell us what you're selling. Get 3 ready-to-post captions with different angles.</div>
                </div>

                {brandSaved && <div className="banner banner-success show">Brand profile loaded - captions now use your saved voice.</div>}

                <div className="card mb-3">
                  <div className="card-eyebrow">Today's post</div>
                  <div className="card-title">What are you selling?</div>

                  <div className="field">
                    <div className="field-label">Product or promo</div>
                    <textarea rows={2} value={contentProduct} onChange={(e) => setContentProduct(e.target.value)} />
                  </div>

                  <div className="field">
                    <div className="field-label">Tone</div>
                    <div className="tone-row">
                      {[
                        "Warm + personal",
                        "Exciting + urgent",
                        "Informative",
                        "Funny + relatable",
                      ].map((tone) => (
                        <button
                          className={contentTone === tone ? "tone-pill on" : "tone-pill"}
                          key={tone}
                          onClick={() => setContentTone(tone)}
                          type="button"
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field mb-0">
                    <div className="field-label">Type</div>
                    <div className="tone-row">
                      {[
                        { key: "caption", label: "FB caption" },
                        { key: "story", label: "Story text" },
                        { key: "description", label: "Product desc" },
                        { key: "reel", label: "Reel hook" },
                      ].map((item) => (
                        <button
                          className={contentType === item.key ? "tone-pill on" : "tone-pill"}
                          key={item.key}
                          onClick={() => setContentType(item.key as ContentType)}
                          type="button"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary btn-full" onClick={handleGenerateContent} type="button">
                  Generate caption + image
                </button>

                <div className={contentLoading ? "loading show" : "loading"}>
                  <div className="spinner" />
                  <span className="loading-text">Writing your captions and preparing your image...</span>
                </div>

                {contentResult && (
                  <div className="output show">
                    <div className="output-label">Your 3 captions - copy your favorite</div>
                    {contentResult.captions.map((cap, idx) => (
                      <div className="out-card" key={`${cap.label}-${idx}`}>
                        <div className="out-tag">Option {idx + 1} - {cap.label}</div>
                        <div className="out-text">{cap.text}</div>
                        <div className="out-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => copyText(cap.text)} type="button">
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="banner banner-tip show">
                      <strong>Post first:</strong> {contentResult.tip}
                    </div>

                    <div className="img-gen-section show">
                      <div className="img-gen-label">Visual content</div>
                      <div className="gen-mode-row">
                        <button className={genMode === "ai" ? "gen-mode-pill on" : "gen-mode-pill"} onClick={() => setGenMode("ai")} type="button">
                          Generate AI image
                        </button>
                        <button className={genMode === "tip" ? "gen-mode-pill on" : "gen-mode-pill"} onClick={() => setGenMode("tip")} type="button">
                          How to shoot it yourself
                        </button>
                      </div>

                      {genMode === "ai" ? (
                        <>
                          <div className="img-prompt-box show">{contentResult.imagePrompt}</div>
                          <button className="btn btn-primary btn-full" onClick={() => generateImagePreview(contentResult.imagePrompt)} type="button">
                            Generate food image
                          </button>
                          {generatedImage && (
                            <div className="img-result show">
                              <img alt="Generated food" src={generatedImage} />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="photo-tip-box show">
                          <strong>How to shoot it yourself:</strong> {contentResult.photoTip}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className={page === "convert" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Conversion Kit · Module 3
                  </div>
                  <div className="page-title">
                    The right words<br />
                    <em>when it matters most.</em>
                  </div>
                  <div className="page-sub">Pick your situation. Get the exact script and why it works.</div>
                </div>

                <div className="card mb-3">
                  <div className="card-eyebrow">What's happening?</div>
                  <div className="card-title">Pick your situation</div>

                  <div className="sit-grid">
                    {[
                      { id: "magkano", emoji: "💬", title: '"Magkano?"', desc: "Answer price without losing them" },
                      { id: "ghost", emoji: "👻", title: "Buyer went cold", desc: "Soft follow-up that doesn't feel desperate" },
                      { id: "discount", emoji: "🙏", title: '"May bawas pa?"', desc: "Hold your price with warmth" },
                      { id: "firsttime", emoji: "🆕", title: "First-time buyer", desc: "Build trust, reduce hesitation" },
                      { id: "close", emoji: "🔥", title: "Ready to close", desc: "Push to order without being pushy" },
                      { id: "complaint", emoji: "😤", title: "Unhappy customer", desc: "Handle without losing the relationship" },
                    ].map((sit) => (
                      <button
                        className={situation === sit.id ? "sit-card on" : "sit-card"}
                        key={sit.id}
                        onClick={() => setSituation(sit.id as SituationId)}
                        type="button"
                      >
                        <span className="sit-emoji">{sit.emoji}</span>
                        <div className="sit-title">{sit.title}</div>
                        <div className="sit-desc">{sit.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="field mb-0">
                    <div className="field-label">
                      Extra context <span className="field-optional">(optional)</span>
                    </div>
                    <input
                      onChange={(e) => setConvertContext(e.target.value)}
                      placeholder="e.g. She said my price is too high compared to a carenderia..."
                      type="text"
                      value={convertContext}
                    />
                  </div>
                </div>

                <button className="btn btn-primary btn-full" onClick={handleGenerateScript} type="button">
                  Generate my script
                </button>

                <div className={convertLoading ? "loading show" : "loading"}>
                  <div className="spinner" />
                  <span className="loading-text">Writing your personalized script...</span>
                </div>

                {scriptResult && (
                  <div className="output show">
                    <div className="output-label">Your script</div>
                    <div className="out-card">
                      <div className="out-tag">DM script - copy and send</div>
                      <div className="out-text">{scriptResult.script}</div>
                      <div className="out-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => copyText(scriptResult.script)} type="button">
                          Copy to DM
                        </button>
                      </div>
                    </div>
                    <div className="banner banner-tip show">
                      <strong>Why this works:</strong> {scriptResult.why}
                    </div>
                    <div className="banner banner-warn show">
                      <strong>Do not say:</strong> {scriptResult.avoid}
                    </div>
                  </div>
                )}
              </section>

              <section className={page === "outcomes" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Outcomes Tracker · Beta
                  </div>
                  <div className="page-title">
                    Did your posts<br />
                    <em>get orders?</em>
                  </div>
                  <div className="page-sub">Every result you log teaches the system what works for your market.</div>
                </div>

                <div className="card-eyebrow" style={{ marginBottom: 10 }}>
                  Waiting for your feedback
                </div>
                {pendingOutcomes.length === 0 ? (
                  <div className="banner banner-tip show" style={{ marginBottom: 14 }}>
                    Generate a post or script first, then log the real-world outcome here.
                  </div>
                ) : (
                  pendingOutcomes.map((item) => (
                    <div className="outcome-pending-card" key={`pending-${item.id}`}>
                      <div className="outcome-type-label">{item.type === "caption" ? "Content post" : "DM script"}</div>
                      <div className="outcome-preview">{item.preview}</div>
                      <div className="outcome-question">What happened after you used this?</div>
                      <div className="outcome-btns">
                        <button className="outcome-btn yes" onClick={() => logOutcome(item.id, "yes")} type="button">
                          Got order
                        </button>
                        <button className="outcome-btn dm" onClick={() => logOutcome(item.id, "dm")} type="button">
                          Got DMs only
                        </button>
                        <button className="outcome-btn no" onClick={() => logOutcome(item.id, "no")} type="button">
                          No response
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <hr className="divider" />

                <div className="card-eyebrow" style={{ marginBottom: 12 }}>
                  Your results this session
                </div>
                <div className="stat-row" style={{ marginBottom: 16 }}>
                  <div className="stat-card">
                    <div className="stat-icon-wrap">✓</div>
                    <div>
                      <div className="stat-num" style={{ color: "var(--success)" }}>
                        {yesCount}
                      </div>
                      <div className="stat-lbl">Got orders</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap">~</div>
                    <div>
                      <div className="stat-num" style={{ color: "var(--gold)" }}>
                        {dmCount}
                      </div>
                      <div className="stat-lbl">Got DMs only</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap">✗</div>
                    <div>
                      <div className="stat-num" style={{ color: "var(--danger)" }}>
                        {noCount}
                      </div>
                      <div className="stat-lbl">No response</div>
                    </div>
                  </div>
                </div>

                {patternInsights.length > 0 && (
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div className="card-eyebrow">What's working</div>
                    <div className="card-title" style={{ marginBottom: 10 }}>
                      Patterns from your results
                    </div>
                    {patternInsights.map((insight) => (
                      <div className="pattern-item" key={insight}>
                        {insight}
                      </div>
                    ))}
                  </div>
                )}

                {loggedOutcomes.length > 0 && (
                  <>
                    <hr className="divider" />
                    <div className="card-eyebrow" style={{ marginBottom: 10 }}>
                      History
                    </div>
                    {loggedOutcomes.map((item) => (
                      <div className="history-item" key={`history-${item.id}`}>
                        <span className={`outcome-logged ${item.feedback}`}>{item.feedback === "yes" ? "Order" : item.feedback === "dm" ? "DM" : "No response"}</span>
                        <span>{item.type === "caption" ? "Content post" : "DM script"}</span>
                        <span style={{ marginLeft: "auto" }}>{item.createdAt}</span>
                      </div>
                    ))}
                  </>
                )}
              </section>
            </div>

            <aside className="right-panel">
              {page === "brand" ? (
                <>
                  <div className="rp-section">
                    <div className="rp-label">Live preview</div>
                    <div className="rp-sub" style={{ marginBottom: 10 }}>
                      This updates as you type in Brand Builder.
                    </div>
                    <div
                      className="fb-preview"
                      style={{
                        borderColor: hexToRgba(previewPrimary, 0.35),
                        background: hexToRgba(previewBackground, 0.18),
                      }}
                    >
                      <div
                        className="fb-header"
                        style={{
                          borderBottomColor: hexToRgba(previewPrimary, 0.22),
                          background: hexToRgba(previewBackground, 0.26),
                        }}
                      >
                        <div className="fb-avatar" style={{ background: previewPrimary }}>
                          M
                        </div>
                        <div>
                          <div className="fb-name">{activeBrandProfile.businessName || previewName}</div>
                          <div className="fb-time">Just now · Public</div>
                        </div>
                      </div>
                      <div
                        className="fb-body"
                        style={{
                          background: hexToRgba(previewBackground, 0.2),
                          borderLeft: `3px solid ${hexToRgba(previewSecondary, 0.8)}`,
                        }}
                      >
                        {previewOneLiner}
                      </div>
                      <div className="fb-footer" style={{ borderTopColor: hexToRgba(previewPrimary, 0.2) }}>
                        <span className="fb-action" style={{ color: previewPrimary }}>
                          Like
                        </span>
                        <span className="fb-action" style={{ color: previewPrimary }}>
                          Comment
                        </span>
                        <span className="fb-action" style={{ color: previewPrimary }}>
                          Share
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">Brand DNA</div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Vibe:</strong> {activeBrandProfile.brandVoice}
                    </div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Visual style:</strong>{" "}
                      {visualStyles.find((opt) => opt.id === brandForm.visualStyle)?.name}
                    </div>
                    <div className="rp-sub">{summarize(brandForm.surprise, 120)}</div>
                  </div>
                </>
              ) : page === "content" ? (
                <>
                  <div className="rp-section">
                    <div className="rp-label">Post preview</div>
                    <div className="fb-preview">
                      <div className="fb-header">
                        <div className="fb-avatar" style={{ background: previewPrimary }}>
                          M
                        </div>
                        <div>
                          <div className="fb-name">{activeBrandProfile.businessName}</div>
                          <div className="fb-time">Just now · Public</div>
                        </div>
                      </div>
                      {generatedImage ? (
                        <img alt="Post preview" className="post-preview-img show" src={generatedImage} />
                      ) : (
                        <div className="post-preview-img-placeholder">Your image preview appears here</div>
                      )}
                      <div className="fb-body">{contentResult ? summarize(contentResult.captions[0].text, 140) : "Your best caption will appear here after generating..."}</div>
                      <div className="fb-footer">
                        <span className="fb-action">Like</span>
                        <span className="fb-action">Comment</span>
                        <span className="fb-action">Share</span>
                      </div>
                    </div>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">Posting tips</div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Photo first:</strong> posts with clear food visuals usually get more saves.
                    </div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Best times:</strong> 7-9am, 12-1pm, and 6-8pm windows.
                    </div>
                    <div className="rp-sub">
                      <strong style={{ color: "var(--text-primary)" }}>Reply fast:</strong> comment replies within one hour help reach.
                    </div>
                  </div>
                </>
              ) : page === "convert" ? (
                <>
                  <div className="rp-section">
                    <div className="rp-label">DM preview</div>
                    <div className="msg-preview">
                      {scriptResult ? (
                        <>
                          <div className="msg-bubble">{scriptResult.script}</div>
                          <div className="msg-time">You · just now</div>
                        </>
                      ) : (
                        <>
                          <div className="msg-bubble">Kamusta po! Interesado ako sa inyong kare-kare. Pwede po ba malaman ang presyo?</div>
                          <div className="msg-time">You · just now</div>
                          <div className="msg-preview-hint">Your script will appear here after generation.</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">Situation tips</div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Lead with value:</strong> explain quality before price to reduce bargaining pressure.
                    </div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Add social proof:</strong> mention repeat buyers naturally to build trust.
                    </div>
                    <div className="rp-sub">
                      <strong style={{ color: "var(--text-primary)" }}>End with a question:</strong> a specific next-step question increases replies.
                    </div>
                  </div>
                </>
              ) : page === "outcomes" ? (
                <>
                  <div className="rp-section">
                    <div className="rp-label">Why this matters</div>
                    <div className="rp-sub" style={{ marginBottom: 8 }}>
                      Every outcome you log is a data point. Over time this highlights what content and DM angles actually convert.
                    </div>
                    <div className="rp-sub">This is the feedback loop that turns output into repeatable sales patterns.</div>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">How it works</div>
                    <div className="rp-sub" style={{ marginBottom: 6 }}>1. Generate a post or script</div>
                    <div className="rp-sub" style={{ marginBottom: 6 }}>2. Use it in your channel</div>
                    <div className="rp-sub" style={{ marginBottom: 6 }}>3. Log what happened</div>
                    <div className="rp-sub">4. Review patterns and iterate</div>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">Session stats</div>
                    <div className="rp-sub">Orders: {yesCount}</div>
                    <div className="rp-sub">DM only: {dmCount}</div>
                    <div className="rp-sub">No response: {noCount}</div>
                    <div className="rp-sub" style={{ marginTop: 6 }}>
                      Pending feedback: {pendingOutcomes.length}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rp-section">
                    <div className="rp-label">Brand snapshot</div>
                    <div className="rp-brand-card">
                      <div className="rp-brand-name">{activeBrandProfile.businessName || previewName}</div>
                      <div className="rp-brand-one">{summarize(activeBrandProfile.oneLiner, 95)}</div>
                    </div>
                    <div className="rp-sub">
                      Voice: <strong style={{ color: "var(--accent-text)" }}>{activeBrandProfile.brandVoice}</strong>
                    </div>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">Quick actions</div>
                    <button className="rp-quick-btn" onClick={() => setPage("content")} type="button">
                      <span className="rp-quick-icon">✦</span> Generate a post now
                    </button>
                    <button className="rp-quick-btn" onClick={() => setPage("convert")} type="button">
                      <span className="rp-quick-icon">◎</span> Get a DM script
                    </button>
                    <button className="rp-quick-btn" onClick={() => setPage("brand")} type="button">
                      <span className="rp-quick-icon">◇</span> Edit brand profile
                    </button>
                  </div>

                  <div className="rp-section">
                    <div className="rp-label">Today's insight</div>
                    <div className="rp-sub">
                      MSMEs that post 3-5x per week on Facebook get <strong style={{ color: "var(--accent-text)" }}>2.4x more</strong>{" "}
                      DM inquiries than pages posting less often.
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>

      <div className="theme-switcher">
        <span className="ts-label">Theme</span>
        <div className="ts-btns">
          <button className={theme === "light" ? "ts-btn on" : "ts-btn"} onClick={() => setTheme("light")} type="button">
            Light
          </button>
          <button className={theme === "dark" ? "ts-btn on" : "ts-btn"} onClick={() => setTheme("dark")} type="button">
            Dark
          </button>
          <button className={theme === "noir" ? "ts-btn on" : "ts-btn"} onClick={() => setTheme("noir")} type="button">
            Noir
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
