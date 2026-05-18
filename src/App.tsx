import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHero from "@/components/MobileHero";
import MobileTabBar from "@/components/MobileTabBar";
import BrandReveal from "@/components/BrandReveal";

type Theme = "light" | "dark" | "warm" | "ube" | "editorial";
type Page = "news" | "home" | "brand" | "content" | "convert" | "outcomes";
type NewsCategory = "msme" | "facebook" | "food" | "gov" | "events";

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

type TrendInfo = {
  id: string;
  name: string;
  description?: string;
  freshness?: string;
  audience?: string;
};

type ContentResult = {
  captions: CaptionOption[];
  tip: string;
  imagePrompt: string;
  photoTip: string;
  trend?: TrendInfo | null;
};

const TREND_OPTIONS: { id: string; name: string; freshness: string }[] = [
  { id: "auto", name: "Auto-pick best trend", freshness: "Smart" },
  { id: "mil-vs-genz", name: "Millennial vs Gen Z caption", freshness: "🔥 Hot" },
  { id: "pov", name: "POV / Tell me without telling me", freshness: "Viral" },
  { id: "carousel-hook", name: "Carousel swipe hook", freshness: "Steady" },
  { id: "walang-basagan", name: "'Walang basagan ng trip' relatable", freshness: "Steady" },
  { id: "before-after", name: "Before / after reveal", freshness: "Evergreen" },
  { id: "genz-slang", name: "Pure Gen Z slang post", freshness: "🔥 Hot" },
  { id: "tita-long", name: "Tita-friendly long caption", freshness: "Steady" },
  { id: "reel-hook", name: "Reel-style stop-scroll hook", freshness: "🔥 Hot" },
];

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

type PostingDay = { day: string; abbr: string; contentType: string; tip: string };
type WeeklyRhythm = { postsPerWeek: number; schedule: PostingDay[] };
type VoiceRules = { useWords: string[]; avoidWords: string[]; example: string };

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
  heroImage?: string | null;
  weeklyRhythm?: WeeklyRhythm;
  voiceRules?: VoiceRules;
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
  {
    id: 5,
    category: "events",
    categoryLabel: "Events near me",
    headline: "Fiesta sa San Pedro, Makati — May 15 weekend",
    summary:
      "Barangay fiesta expecting 2,000+ foot traffic. Pre-order posts for handa platters and pasalubong bundles tend to spike 3–5 days before. Drop a 'reserve your bilao' caption now.",
    tags: ["Fiesta", "Pre-orders", "Makati"],
  },
  {
    id: 6,
    category: "events",
    categoryLabel: "Events near me",
    headline: "Mercato Centrale weekend market — BGC, May 17–18",
    summary:
      "Open slots for home-based food sellers. Even without a booth, post a 'we're inspired by BGC weekend cravings' angle and ride the search interest.",
    tags: ["Expo", "BGC", "Weekend"],
  },
  {
    id: 7,
    category: "events",
    categoryLabel: "Events near me",
    headline: "Sikat Pinoy Food Expo at SMX — May 22–25",
    summary:
      "National MSME food expo. Use it as a content hook: behind-the-scenes of your kitchen, your origin story, or a 'kung nasa expo kami…' reel.",
    tags: ["Expo", "DTI", "Content hook"],
  },
];

const navItems: Array<{ page: Page; labelKey: string; icon: string; comingSoon?: boolean }> = [
  { page: "news", labelKey: "nav.news", icon: "◐" },
  { page: "home", labelKey: "nav.home", icon: "◈" },
  { page: "brand", labelKey: "nav.brand", icon: "◇" },
  { page: "content", labelKey: "nav.content", icon: "✦" },
  { page: "convert", labelKey: "nav.convert", icon: "◎" },
  { page: "outcomes", labelKey: "nav.outcomes", icon: "◉", comingSoon: true },
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

function contrastText(hex: string) {
  const n = (hex || "").replace("#", "");
  if (n.length !== 6) return "#1a1a1a";
  const toLin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = toLin(parseInt(n.slice(0, 2), 16));
  const g = toLin(parseInt(n.slice(2, 4), 16));
  const b = toLin(parseInt(n.slice(4, 6), 16));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.55 ? "#1a1a1a" : "#ffffff";
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
    weeklyRhythm: {
      postsPerWeek: 3,
      schedule: [
        { day: "Monday", abbr: "Mon", contentType: "Product story", tip: `Share the story behind today's dish` },
        { day: "Wednesday", abbr: "Wed", contentType: "Customer reaction", tip: `Post a buyer message or feedback` },
        { day: "Friday", abbr: "Fri", contentType: "Weekend promo", tip: `Open pre-orders with a limited-slot hook` },
      ],
    },
    voiceRules: {
      useWords: ["kain na", "lutong bahay", "sariwang gawa", "pampamilya", "sulit"],
      avoidWords: ["premium", "world-class", "order now"],
      example: `Mainit pa 'to at bagong luto — para sa pamilya mo na gustong kumain ng tunay na lutong bahay.`,
    },
  };
}

function toDataUriSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function App() {
  const { lang, setLang, t } = useLang();
  const isMobile = useIsMobile();
  const [theme, setTheme] = useState<Theme>("editorial");
  const [page, setPage] = useState<Page>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches ? "home" : "news"
  );
  const [newsFilter, setNewsFilter] = useState<"all" | NewsCategory>("all");
  const [brandSaved, setBrandSaved] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
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
  const [trendMode, setTrendMode] = useState(true);
  const [trendId, setTrendId] = useState<string>("auto");
  // image generation runs automatically as part of handleGenerateContent
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageAction, setImageAction] = useState<"generate" | "use-direct" | "enhance">("generate");
  const [situation, setSituation] = useState<SituationId>("magkano");
  const [convertContext, setConvertContext] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null);
  const [outcomes, setOutcomes] = useState<OutcomeItem[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  const goToPage = (p: Page) => { setPage(p); setMobileNavOpen(false); };

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
  // Merge computedProfile as base so newly added optional fields (weeklyRhythm, voiceRules)
  // are always present even when brandProfile was saved before those fields existed.
  const activeBrandProfile: BrandProfile = brandSaved && brandProfile
    ? { ...computedProfile, ...brandProfile }
    : computedProfile;
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

  const previewName = brandForm.businessName.trim() || activeBrandProfile.businessName || "Your Business Name";
  const previewOneLiner = activeBrandProfile.oneLiner;
  const previewPrimary = activeBrandProfile.palette[0]?.hex ?? "#7B5EA7";
  const previewSecondary = activeBrandProfile.palette[1]?.hex ?? "#5E7A4D";
  const previewBackground = activeBrandProfile.palette[2]?.hex ?? "#F8F5FF";
  const previewAccent = activeBrandProfile.palette[3]?.hex ?? activeBrandProfile.palette[1]?.hex ?? "#6B3B2A";

  // Try to extract a "deliver / located at" snippet from the product field
  const deliveryMatch = brandForm.product.match(/(?:deliver(?:ing|y)?|located|available|serving)[^.]{0,80}/i);
  const previewLocation = (deliveryMatch?.[0]?.trim() || "Fresh daily · Order ahead").toUpperCase().slice(0, 60);

  function updateBrandField<K extends keyof typeof brandForm>(key: K, value: (typeof brandForm)[K]) {
    setBrandForm((prev) => ({ ...prev, [key]: value }));
    if (brandSaved) {
      setBrandSaved(false);
    }
  }

  async function handleBuildBrandProfile() {
    setBrandLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-brand-profile", {
        body: {
          product: brandForm.product,
          buyer: brandForm.buyer,
          diff: brandForm.diff,
          why: brandForm.why,
          vibe: brandForm.vibe,
          surprise: brandForm.surprise,
          businessName: brandForm.businessName,
          visualStyle: visualStyles.find((s) => s.id === brandForm.visualStyle)?.name ?? brandForm.visualStyle,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.palette?.length) throw new Error("Incomplete profile");

      const profile: BrandProfile = {
        businessName: data.businessName,
        tagline: data.tagline,
        oneLiner: data.oneLiner,
        targetBuyer: data.targetBuyer,
        uniqueValue: data.uniqueValue,
        brandVoice: data.brandVoice,
        emotionalHook: data.emotionalHook,
        contentTip: data.contentTip,
        photographyMood: data.photographyMood,
        palette: data.palette,
        heroImage: data.heroImage ?? null,
        weeklyRhythm: data.weeklyRhythm ?? undefined,
        voiceRules: data.voiceRules ?? undefined,
      };
      setBrandProfile(profile);
      setBrandSaved(true);
      try {
        localStorage.setItem("tindaph_brand_profile", JSON.stringify({
          brandName: profile.businessName,
          personalityTags: profile.brandVoice.split(/[,/&]| and /i).map((s) => s.trim()).filter(Boolean),
          toneWords: profile.voiceRules?.useWords ?? [],
          avoidWords: profile.voiceRules?.avoidWords ?? [],
          contentPillars: profile.weeklyRhythm?.schedule.map((d) => d.contentType) ?? [],
          postingRhythm: profile.weeklyRhythm ?? null,
          positioningStatement: profile.oneLiner,
        }));
      } catch (_) { /* storage unavailable */ }
    } catch (e) {
      console.error("generate-brand-profile failed:", e);
      const msg = e instanceof Error ? e.message : "Generation failed";
      window.alert(`${msg}. Showing offline draft instead.`);
      const generated = generateBrandProfile(brandForm, selectedPalette);
      setBrandProfile(generated);
      setBrandSaved(true);
      try {
        localStorage.setItem("tindaph_brand_profile", JSON.stringify({
          brandName: generated.businessName,
          personalityTags: generated.brandVoice.split(/[,/&]| and /i).map((s) => s.trim()).filter(Boolean),
          toneWords: generated.voiceRules?.useWords ?? [],
          avoidWords: generated.voiceRules?.avoidWords ?? [],
          contentPillars: generated.weeklyRhythm?.schedule.map((d) => d.contentType) ?? [],
          postingRhythm: generated.weeklyRhythm ?? null,
          positioningStatement: generated.oneLiner,
        }));
      } catch (_) { /* storage unavailable */ }
    } finally {
      setBrandLoading(false);
    }
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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setUploadedImage(canvas.toDataURL("image/jpeg", 0.82));
      setImageAction("use-direct");
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
    e.target.value = "";
  }

  async function handleGenerateContent() {
    const product = contentProduct.trim();
    if (!product) {
      window.alert("Please describe what you are posting about.");
      return;
    }

    setContentLoading(true);
    setGeneratedImage("");
    setContentResult(null);

    // Optimistic local fallback so something always renders
    const fallback = generateContentResult(product);

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          product,
          tone: contentTone,
          contentType,
          trendMode,
          trendId,
          brand: {
            businessName: activeBrandProfile.businessName,
            oneLiner: activeBrandProfile.oneLiner,
            brandVoice: activeBrandProfile.brandVoice,
            photographyMood: activeBrandProfile.photographyMood,
            visualStyle:
              visualStyles.find((s) => s.id === brandForm.visualStyle)?.name ?? "Homey & natural",
            palette: activeBrandProfile.palette.map((p) => p.hex),
            voiceRules: activeBrandProfile.voiceRules ?? null,
          },
          uploadedImage: imageAction === "enhance" && uploadedImage ? uploadedImage : null,
          imageAction: uploadedImage ? imageAction : "generate",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result: ContentResult = {
        captions: (data?.captions?.length ? data.captions : fallback.captions) as CaptionOption[],
        tip: data?.tip || fallback.tip,
        imagePrompt: data?.imagePrompt || fallback.imagePrompt,
        photoTip: data?.photoTip || fallback.photoTip,
        trend: data?.trend ?? null,
      };
      setContentResult(result);
      if (imageAction === "use-direct" && uploadedImage) {
        setGeneratedImage(uploadedImage);
      } else if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else if (imageAction === "enhance" && uploadedImage) {
        // Enhancement failed gracefully — fall back to the original upload
        setGeneratedImage(uploadedImage);
      } else {
        generateImagePreview(result.imagePrompt);
      }
      setPostsGenerated((prev) => prev + 3);
      addPendingOutcome("caption", result.captions[0].text, contentType);
    } catch (e) {
      console.error("generate-content failed:", e);
      const msg = e instanceof Error ? e.message : "Generation failed";
      window.alert(`${msg}. Showing offline draft instead.`);
      setContentResult(fallback);
      if (uploadedImage) {
        setGeneratedImage(uploadedImage);
      } else {
        generateImagePreview(fallback.imagePrompt);
      }
      setPostsGenerated((prev) => prev + 3);
      addPendingOutcome("caption", fallback.captions[0].text, contentType);
    } finally {
      setContentLoading(false);
    }
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

  async function handleGenerateScript() {
    setConvertLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: {
          situation,
          extraContext: convertContext,
          brand: {
            businessName: activeBrandProfile.businessName,
            oneLiner: activeBrandProfile.oneLiner,
            brandVoice: activeBrandProfile.brandVoice,
            targetBuyer: activeBrandProfile.targetBuyer,
            uniqueValue: activeBrandProfile.uniqueValue,
            voiceRules: activeBrandProfile.voiceRules ?? null,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.script) throw new Error("No script returned");
      const result: ScriptResult = {
        script: data.script,
        why: data.why || "",
        avoid: data.avoid || "",
      };
      setScriptResult(result);
      setScriptsGenerated((prev) => prev + 1);
      addPendingOutcome("script", result.script, situation);
    } catch (e) {
      console.error("generate-script failed:", e);
      const fallback = generateScriptResult(situation, convertContext);
      setScriptResult(fallback);
      setScriptsGenerated((prev) => prev + 1);
      addPendingOutcome("script", fallback.script, situation);
      alert("AI is unavailable right now. Showing a template script instead.");
    } finally {
      setConvertLoading(false);
    }
  }

  return (
    <>
      <div className="app">
        <nav className={mobileNavOpen ? "sidebar open" : "sidebar"}>
          <div className="sidebar-brand">
            <div className="brand-logo-row">
              <img src="/logo.png" alt="Tinda.ph logo" className="brand-icon-img" />
              <div className="brand-wordmark">
                Tinda<span>.</span>ph
              </div>
            </div>
          </div>

          <div className="user-chip">
            <div className="user-avatar">G</div>
            <div className="user-name">Grace</div>
          </div>

          <div className="nav">
            {navItems.map((item) => (
              <button
                key={item.page}
                className={page === item.page ? "nav-btn active" : "nav-btn"}
                onClick={() => goToPage(item.page)}
                type="button"
              >
                {t(item.labelKey)}
                {item.comingSoon && <span className="nav-badge">Beta</span>}
              </button>
            ))}
          </div>

          <div className="sidebar-settings">
            <div className="sidebar-settings-title">{t("settings.title")}</div>
            <label className="sidebar-setting-row">
              <span className="sidebar-setting-label">{t("settings.lang")}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "taglish" | "english")}
                aria-label={t("settings.lang")}
              >
                <option value="taglish">{t("lang.taglish")}</option>
                <option value="english">{t("lang.english")}</option>
              </select>
            </label>
            <label className="sidebar-setting-row">
              <span className="sidebar-setting-label">{t("settings.theme")}</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                aria-label={t("settings.theme")}
              >
                <option value="editorial">{t("theme.editorial")}</option>
                <option value="light">{t("theme.light")}</option>
                <option value="dark">{t("theme.dark")}</option>
                <option value="warm">{t("theme.warm")}</option>
                <option value="ube">{t("theme.ube")}</option>
              </select>
            </label>
          </div>

          <div className="sidebar-foot">v0.1 Beta</div>
        </nav>

        {mobileNavOpen && (
          <div
            className="nav-scrim"
            role="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="nav-toggle"
                aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                <span /><span /><span />
              </button>
              
            </div>
            <div className="topbar-right" />
          </div>

          <div className="body">
            <div className="content-area">
              <section className={page === "news" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-title">
                    Magandang umaga, <em>Grace.</em>
                  </div>
                  <div className="page-sub">What's moving in Philippine food selling today.</div>
                </div>

                <div className="news-filters">
                  {[
                    { id: "all", label: "All topics" },
                    { id: "events", label: "📍 Events near me" },
                    { id: "msme", label: "MSME news" },
                    { id: "facebook", label: "Facebook selling" },
                    { id: "food", label: "Food trends" },
                    { id: "gov", label: "Government programs" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      className={newsFilter === f.id ? "tone-pill on" : "tone-pill"}
                      onClick={() => setNewsFilter(f.id as "all" | NewsCategory)}
                      type="button"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {visibleNews.map((item) => (
                  <article className="news-card" key={item.id}>
                    <div className="news-cat">{item.categoryLabel}</div>
                    <div className="news-headline">{item.headline}</div>
                    <div className="news-summary">{item.summary}</div>
                    <div className="news-action">
                      {item.category === "events" ? "Create a post around this event →" : "Turn into a post idea →"}
                    </div>
                  </article>
                ))}

                <div className="inline-insight">
                  <strong>Today's insight:</strong> MSMEs that post 3–5× per week on Facebook get
                  {" "}<strong>2.4× more</strong> DM inquiries than pages posting less often.
                </div>
              </section>

              <section className={page === "home" ? "page active" : "page"}>
                {isMobile ? (
                  <MobileHero
                    t={t}
                    userName="Grace"
                    postsGenerated={postsGenerated}
                    scriptsGenerated={scriptsGenerated}
                    brandSaved={brandSaved}
                    trending={newsItems.slice(0, 5).map((n) => ({
                      id: n.id,
                      categoryLabel: n.categoryLabel,
                      headline: n.headline,
                    }))}
                    onPrimary={() => setPage(brandSaved ? "content" : "brand")}
                    onShortcut={(k) =>
                      setPage(k === "caption" ? "content" : k === "brand" ? "brand" : "convert")
                    }
                    onOpenNews={() => setPage("news")}
                    onNewPost={() => setPage("content")}
                    onScripts={() => setPage("convert")}
                  />
                ) : (
                  <div className="page-header">
                    <div className="page-title">
                      {t("home.greet.morning")}, <em>Grace.</em>
                    </div>
                    <div className="page-sub">{t("page.home.sub")}</div>
                  </div>
                )}

                {!isMobile && (
                <div className="stat-inline">
                  <span className="stat-chip">
                    <span className="stat-chip-label">Brand</span>
                    <span className="stat-chip-value">{brandSaved ? "Ready" : "Not set"}</span>
                  </span>
                  <span className="stat-chip">
                    <span className="stat-chip-value">{postsGenerated}</span>
                    <span className="stat-chip-label">posts</span>
                  </span>
                  <span className="stat-chip">
                    <span className="stat-chip-value">{scriptsGenerated}</span>
                    <span className="stat-chip-label">scripts</span>
                  </span>
                  <span className="stat-chip">
                    <span className="stat-chip-value">5-day 🔥</span>
                    <span className="stat-chip-label">streak</span>
                  </span>
                </div>
                )}

                {!isMobile && (<>
                <div className="focus-card">
                  <div className="focus-eyebrow">Today's focus</div>
                  <div className="focus-title">
                    {brandSaved
                      ? "Post a Tuesday merienda teaser by 4 PM"
                      : "Finish your Brand Builder — 6 quick questions"}
                  </div>
                  <div className="focus-sub">
                    {brandSaved
                      ? "Tuesdays 3–5 PM is your top engagement window. Use your 'lola's recipe' angle and end with a question."
                      : "Once your brand is saved, every caption and script will sound like you — automatically."}
                  </div>
                  <button
                    className="focus-btn"
                    onClick={() => setPage(brandSaved ? "content" : "brand")}
                    type="button"
                  >
                    {brandSaved ? "Open Content Engine →" : "Start Brand Builder →"}
                  </button>
                </div>

                <div className="dash-split">
                  <article className="dash-panel">
                    <div className="dash-panel-eyebrow">This week's plan</div>
                    <div className="dash-panel-title">3 posts, 1 story, 1 reel</div>
                    <ul className="weekplan">
                      <li className="weekplan-row done">
                        <span className="wp-day">Mon</span>
                        <span className="wp-task">Behind-the-scenes: morning prep</span>
                        <span className="wp-status">Posted</span>
                      </li>
                      <li className="weekplan-row today">
                        <span className="wp-day">Tue</span>
                        <span className="wp-task">Merienda teaser + question hook</span>
                        <span className="wp-status">Today</span>
                      </li>
                      <li className="weekplan-row">
                        <span className="wp-day">Thu</span>
                        <span className="wp-task">Customer kwento (testimonial)</span>
                        <span className="wp-status">Draft</span>
                      </li>
                      <li className="weekplan-row">
                        <span className="wp-day">Fri</span>
                        <span className="wp-task">Weekend pre-order open</span>
                        <span className="wp-status">Plan</span>
                      </li>
                      <li className="weekplan-row">
                        <span className="wp-day">Sat</span>
                        <span className="wp-task">Reel: ulam reveal</span>
                        <span className="wp-status">Plan</span>
                      </li>
                    </ul>
                  </article>

                  <article
                    className="dash-panel event-panel"
                    onClick={() => { setPage("news"); setNewsFilter("events"); }}
                  >
                    <div className="dash-panel-eyebrow">📍 Event near you</div>
                    <div className="dash-panel-title">Fiesta sa San Pedro — May 15</div>
                    <div className="dash-panel-body">
                      Barangay fiesta in Makati expecting 2,000+ foot traffic. Drop a "reserve your bilao" pre-order post 3 days before to ride the spike.
                    </div>
                    <div className="dash-panel-cta">See all events near me →</div>
                  </article>
                </div>

                <article className="dash-panel mt-3">
                  <div className="dash-panel-eyebrow">Recent activity</div>
                  <ul className="activity">
                    <li><span className="act-dot" /> Generated 3 captions for "Adobo combo" — 2h ago</li>
                    <li><span className="act-dot" /> Saved a hagglers script — yesterday</li>
                    <li><span className="act-dot" /> Updated brand voice to "Warm &amp; homey" — 2 days ago</li>
                    <li><span className="act-dot" /> Logged 4 orders from Sunday post — 3 days ago</li>
                  </ul>
                </article>

                <div className="dash-grid mt-3">
                  <article className="dash-card" onClick={() => setPage("brand")}>
                    <div className="dash-card-arrow">→</div>
                    <div className="dash-card-title">Brand Builder</div>
                    <div className="dash-card-sub">Set your foundation once. Powers everything.</div>
                  </article>
                  <article className="dash-card" onClick={() => setPage("content")}>
                    <div className="dash-card-arrow">→</div>
                    <div className="dash-card-title">Content Engine</div>
                    <div className="dash-card-sub">Generate captions in your voice.</div>
                  </article>
                  <article className="dash-card" onClick={() => setPage("convert")}>
                    <div className="dash-card-arrow">→</div>
                    <div className="dash-card-title">Conversion Kit</div>
                    <div className="dash-card-sub">The right words for every buyer situation.</div>
                  </article>
                </div>
                </>)}
              </section>

              <section className={page === "brand" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Brand Builder
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

                <button className="btn btn-primary btn-full" onClick={handleBuildBrandProfile} type="button" disabled={brandLoading}>
                  {brandLoading ? "Building your brand profile…" : "Build my brand profile + color palette"}
                </button>

                {brandLoading && (
                  <div className="loading show">
                    <div className="spinner" />
                    <span className="loading-text">Crafting your positioning, voice, and palette…</span>
                  </div>
                )}

                {brandSaved && (
                  <div className="output show">
                    <BrandReveal
                      profile={activeBrandProfile}
                      visualStyleName={visualStyles.find((s) => s.id === brandForm.visualStyle)?.name}
                      onGeneratePosts={() => setPage("content")}
                      onCreateCover={() => setPage("content")}
                      onCreateMenu={() => setPage("content")}
                      onCreatePhotoPrompts={() => setPage("content")}
                    />
                  </div>
                )}
              </section>

              <section className={page === "content" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Content Engine
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

                  <div className="field mb-0" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border, rgba(0,0,0,0.08))" }}>
                    <div className="field-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span>🔥 Trend-aware mode</span>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" checked={trendMode} onChange={(e) => setTrendMode(e.target.checked)} />
                        <span>{trendMode ? "On" : "Off"}</span>
                      </label>
                    </div>
                    {trendMode && (
                      <>
                        <select
                          value={trendId}
                          onChange={(e) => setTrendId(e.target.value)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border, rgba(0,0,0,0.15))", background: "transparent", color: "inherit", fontSize: 14 }}
                        >
                          {TREND_OPTIONS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.freshness ? `· ${t.freshness}` : ""}
                            </option>
                          ))}
                        </select>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                          We'll match the latest FB posting trends (Millennial vs Gen Z dual captions, POV hooks, Taglish slang, etc.) to your brand voice.
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Photo upload */}
                <div className="photo-upload-section">
                  <div className="photo-upload-header">
                    <span className="photo-upload-label">📸 Your product photo</span>
                    <label className="photo-upload-btn" htmlFor="content-photo-upload">
                      {uploadedImage ? "Change photo" : "Upload photo"}
                      <input
                        id="content-photo-upload"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {uploadedImage && (
                    <div className="photo-upload-preview">
                      <img src={uploadedImage} alt="Your product" className="photo-upload-img" />
                      <div className="photo-upload-actions">
                        <button
                          type="button"
                          className={`photo-action-btn ${imageAction === "use-direct" ? "active" : ""}`}
                          onClick={() => setImageAction("use-direct")}
                        >
                          Use as-is
                        </button>
                        <button
                          type="button"
                          className={`photo-action-btn ${imageAction === "enhance" ? "active" : ""}`}
                          onClick={() => setImageAction("enhance")}
                        >
                          Enhance with AI
                        </button>
                        <button
                          type="button"
                          className="photo-remove-btn"
                          onClick={() => { setUploadedImage(null); setImageAction("generate"); }}
                        >
                          Remove
                        </button>
                      </div>
                      <p className="photo-upload-hint">
                        {imageAction === "use-direct"
                          ? "Your photo will be used directly as the post image."
                          : "AI will enhance your photo to match your brand style."}
                      </p>
                    </div>
                  )}
                </div>

                {brandSaved && (
                  <div className="brand-profile-pill">
                    <span className="brand-profile-pill-dot" />
                    Using your brand profile
                  </div>
                )}

                <button className="btn btn-primary btn-full" onClick={handleGenerateContent} type="button">
                  {uploadedImage && imageAction === "use-direct" ? "Generate caption" : "Generate caption + image"}
                </button>

                <div className={contentLoading ? "loading show" : "loading"}>
                  <div className="spinner" />
                  <span className="loading-text">
                    {uploadedImage && imageAction === "use-direct"
                      ? "Writing your captions..."
                      : uploadedImage && imageAction === "enhance"
                      ? "Writing your captions and enhancing your photo..."
                      : "Writing your captions and preparing your image..."}
                  </span>
                </div>

                {contentResult && (
                  <div className="output show">
                    {contentResult.trend && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                        🔥 Trend applied: {contentResult.trend.name}
                      </div>
                    )}
                    {(() => {
                      const isDual =
                        contentResult.trend?.id === "mil-vs-genz" &&
                        contentResult.captions.length === 2;
                      if (isDual) {
                        return (
                          <>
                            <div className="output-label">
                              Same image, two captions — post them side-by-side
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: 12,
                                padding: 12,
                              }}
                            >
                               {contentResult.captions.map((cap, idx) => {
                                 const isGenZ = idx === 1;
                                 // Decorative emoji stickers overlaid on the Gen Z image
                                 const stickers = [
                                   { e: "💅", top: "6%", left: "6%", rot: -12 },
                                   { e: "✨", top: "8%", right: "8%", rot: 10 },
                                   { e: "🔥", bottom: "10%", left: "8%", rot: -8 },
                                   { e: "😭", bottom: "6%", right: "6%", rot: 14 },
                                 ];
                                 return (
                                 <div
                                   key={`dual-${idx}`}
                                   style={{
                                     display: "flex",
                                     flexDirection: "column",
                                     gap: 8,
                                     borderRight:
                                       idx === 0
                                         ? "1px solid hsl(var(--border))"
                                         : "none",
                                     paddingRight: idx === 0 ? 12 : 0,
                                     paddingLeft: idx === 1 ? 12 : 0,
                                   }}
                                 >
                                   <div
                                     style={{
                                       fontWeight: 700,
                                       fontSize: 13,
                                       textAlign: "center",
                                     }}
                                   >
                                     {cap.label}
                                   </div>
                                   {generatedImage ? (
                                     <div style={{ position: "relative", width: "100%" }}>
                                       <img
                                         alt="Post visual"
                                         src={generatedImage}
                                         style={{
                                           width: "100%",
                                           borderRadius: 8,
                                           objectFit: "cover",
                                           aspectRatio: "1 / 1",
                                           display: "block",
                                         }}
                                       />
                                       {isGenZ && stickers.map((s, i) => (
                                         <span
                                           key={i}
                                           style={{
                                             position: "absolute",
                                             top: s.top,
                                             left: s.left,
                                             right: s.right,
                                             bottom: s.bottom,
                                             fontSize: 28,
                                             lineHeight: 1,
                                             transform: `rotate(${s.rot}deg)`,
                                             filter: "drop-shadow(0 2px 4px rgba(0,0,0,.35))",
                                             pointerEvents: "none",
                                           }}
                                         >
                                           {s.e}
                                         </span>
                                       ))}
                                     </div>
                                   ) : (
                                     <div
                                       style={{
                                         width: "100%",
                                         aspectRatio: "1 / 1",
                                         borderRadius: 8,
                                         background: "hsl(var(--muted))",
                                       }}
                                     />
                                   )}
                                   <div
                                     style={{
                                       fontSize: 12,
                                       lineHeight: 1.45,
                                       textAlign: isGenZ ? "center" : "left",
                                       fontStyle: isGenZ ? "italic" : "normal",
                                       flex: 1,
                                     }}
                                   >
                                     {cap.text}
                                   </div>
                                   <button
                                     className="btn btn-outline btn-sm"
                                     onClick={() => copyText(cap.text)}
                                     type="button"
                                   >
                                     Copy {cap.label.split(" ")[0]} caption
                                   </button>
                                 </div>
                                 );
                               })}
                            </div>
                          </>
                        );
                      }
                      return (
                        <>
                          <div className="output-label">
                            Your {contentResult.captions.length}{" "}
                            {contentResult.captions.length === 1 ? "caption" : "captions"} - copy your favorite
                          </div>
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
                        </>
                      );
                    })()}
                    <div className="banner banner-tip show">
                      <strong>Post first:</strong> {contentResult.tip}
                    </div>

                    <div className="img-gen-section show">
                      <div className="img-gen-label">
                        {contentResult.trend?.id === "mil-vs-genz"
                          ? "Source image (used in both panels above)"
                          : "Generated image"}
                      </div>
                      {generatedImage ? (
                        <>
                          <div className="img-result show">
                            <img alt="Generated food" src={generatedImage} />
                          </div>
                          <button
                            type="button"
                            className="img-download-btn"
                            onClick={async () => {
                              try {
                                const res = await fetch(generatedImage);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${(contentProduct || "food").replace(/\s+/g, "-").toLowerCase()}-image.png`;
                                a.click();
                                URL.revokeObjectURL(url);
                              } catch {
                                const a = document.createElement("a");
                                a.href = generatedImage;
                                a.download = "food-image.png";
                                a.target = "_blank";
                                a.click();
                              }
                            }}
                          >
                            ↓ Download image
                          </button>
                        </>
                      ) : (
                        <div className="img-prompt-box show">Image is being prepared…</div>
                      )}
                      {contentResult.photoTip && (
                        <div className="photo-tip-box show" style={{ marginTop: 12 }}>
                          <strong>Shoot it yourself:</strong> {contentResult.photoTip}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className={page === "convert" ? "page active" : "page"}>
                <div className="page-header">
                  <div className="page-eyebrow">
                    <span className="eyebrow-dot" /> Conversion Kit
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

                {brandSaved && (
                  <div className="brand-profile-pill">
                    <span className="brand-profile-pill-dot" />
                    Using your brand profile
                  </div>
                )}

                <button className="btn btn-primary btn-full" onClick={handleGenerateScript} type="button">
                  Generate my script
                </button>

                <div className={convertLoading ? "loading show" : "loading"}>
                  <div className="spinner" />
                  <span className="loading-text">AI is writing your personalized script...</span>
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

            {(page === "brand" || page === "content" || page === "convert" || page === "outcomes") && (
            <aside className="right-panel">
              {page === "brand" ? (
                <>
                  <div className="rp-section">
                    <div className="rp-label">Live preview</div>
                    <div className="rp-sub" style={{ marginBottom: 10 }}>
                      This updates as you type in Brand Builder.
                    </div>
                    <div className="fb-post-mock">
                      <div className="fb-header">
                        <div className="fb-avatar" style={{ background: previewPrimary }}>
                          {previewName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fb-name">{previewName}</div>
                          <div className="fb-time">Just now · 🌐</div>
                        </div>
                        <span className="fb-more">⋯</span>
                      </div>
                      <div className="fb-caption-row">
                        <span className="fb-caption">{summarize(previewOneLiner, 110)}</span>
                        <span className="fb-see-more">See more</span>
                      </div>
                      <div
                        className="fb-hero"
                        style={{
                          background: activeBrandProfile.heroImage
                            ? "transparent"
                            : `linear-gradient(135deg, ${hexToRgba(previewBackground, 1)} 0%, ${hexToRgba(previewSecondary, 0.55)} 60%, ${hexToRgba(previewPrimary, 0.85)} 100%)`,
                        }}
                      >
                        {activeBrandProfile.heroImage ? (
                          <img alt="Brand hero" className="fb-hero-img" src={activeBrandProfile.heroImage} />
                        ) : (
                          <div className="fb-hero-placeholder">Your hero photo</div>
                        )}
                        <div
                          className="fb-overlay-pill"
                          style={{ background: previewSecondary, color: contrastText(previewSecondary) }}
                        >
                          {previewLocation}
                        </div>
                        <div
                          className="fb-overlay-banner"
                          style={{ background: previewPrimary, color: contrastText(previewPrimary) }}
                        >
                          <div className="fb-overlay-stripe" style={{ background: previewAccent }} />
                          <div className="fb-overlay-wordmark">{previewName}</div>
                          <div className="fb-overlay-tagline">{summarize(activeBrandProfile.tagline, 36)}</div>
                        </div>
                      </div>
                      <div className="fb-footer">
                        <span className="fb-action">👍 7</span>
                        <span className="fb-action">💬 2</span>
                        <span className="fb-action">↗ 3 shares</span>
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
                    <div className="fb-post-mock">
                      <div className="fb-header">
                        <div className="fb-avatar" style={{ background: previewPrimary }}>
                          {previewName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fb-name">{previewName}</div>
                          <div className="fb-time">Just now · 🌐</div>
                        </div>
                        <span className="fb-more">⋯</span>
                      </div>
                      <div className="fb-caption-row">
                        <span className="fb-caption">
                          {contentResult ? summarize(contentResult.captions[0].text, 110) : summarize(previewOneLiner, 110)}
                        </span>
                        <span className="fb-see-more">See more</span>
                      </div>
                      <div
                        className="fb-hero"
                        style={{
                          background: (generatedImage || activeBrandProfile.heroImage)
                            ? "transparent"
                            : `linear-gradient(135deg, ${hexToRgba(previewBackground, 1)} 0%, ${hexToRgba(previewSecondary, 0.55)} 60%, ${hexToRgba(previewPrimary, 0.85)} 100%)`,
                        }}
                      >
                        {generatedImage ? (
                          <img alt="Post preview" className="fb-hero-img" src={generatedImage} />
                        ) : activeBrandProfile.heroImage ? (
                          <img alt="Brand hero" className="fb-hero-img" src={activeBrandProfile.heroImage} />
                        ) : (
                          <div className="fb-hero-placeholder">Your hero photo</div>
                        )}
                        <div className="fb-overlay-pill" style={{ background: previewSecondary, color: contrastText(previewSecondary) }}>
                          {previewLocation}
                        </div>
                        <div className="fb-overlay-banner" style={{ background: previewPrimary, color: contrastText(previewPrimary) }}>
                          <div className="fb-overlay-stripe" style={{ background: previewAccent }} />
                          <div className="fb-overlay-wordmark">{previewName}</div>
                          <div className="fb-overlay-tagline">{summarize(activeBrandProfile.tagline, 36)}</div>
                        </div>
                      </div>
                      <div className="fb-footer">
                        <span className="fb-action">👍 7</span>
                        <span className="fb-action">💬 2</span>
                        <span className="fb-action">↗ 3 shares</span>
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
              ) : null}
            </aside>
            )}
          </div>
        </div>
      </div>
      {isMobile && (
        <MobileTabBar
          t={t}
          active={
            page === "home" ? "home" :
            page === "news" ? "news" :
            page === "convert" ? "scripts" :
            page === "brand" ? "ako" :
            page === "content" ? "new" : "home"
          }
          onSelect={(tab) => {
            if (tab === "home") setPage("home");
            else if (tab === "news") setPage("news");
            else if (tab === "new") setPage("content");
            else if (tab === "scripts") setPage("convert");
            else if (tab === "ako") setPage("brand");
          }}
        />
      )}
    </>
  );
}

export default App;
