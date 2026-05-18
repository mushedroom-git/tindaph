import { useEffect, useState } from "react";

export type Lang = "taglish" | "english";

const LS_KEY = "tindaph.lang";

type Dict = Record<string, string>;

const COPY: Record<Lang, Dict> = {
  taglish: {
    // Nav
    "nav.news": "Trending Ngayon",
    "nav.home": "Dashboard",
    "nav.brand": "Brand Builder",
    "nav.content": "Bagong Post",
    "nav.convert": "Reply Assistant",
    "nav.outcomes": "Resulta",
    // Page subs
    "page.news.sub": "Ano'ng uso ngayon sa Filipino food selling.",
    "page.home.sub": "Eto ang dapat asikasuhin ngayon.",
    "page.brand.sub": "Buuin ang kuwento at positioning mo.",
    "page.content.sub": "Mag-generate ng caption sa boses mo.",
    "page.convert.sub": "Mga script para sa seryosong buyer.",
    "page.outcomes.sub": "I-log kung ano ang naging order.",
    // Settings
    "settings.title": "Settings",
    "settings.lang": "Wika",
    "settings.theme": "Tema",
    "lang.taglish": "Taglish",
    "lang.english": "English",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.warm": "Warm",
    "theme.ube": "Ube",
    "theme.editorial": "Editorial",
    // Home
    "home.greet.morning": "Magandang umaga",
    "home.greet.noon": "Magandang tanghali",
    "home.greet.afternoon": "Magandang hapon",
    "home.greet.evening": "Magandang gabi",
    "home.greet.default": "Kumusta",
    "home.this_week": "Ngayong linggo",
    "home.posts_generated": "Posts na-generate",
    "home.scripts_generated": "Scripts na-generate",
    "home.action.new_post": "Bagong post",
    "home.action.brand_setup": "Brand setup",
    "home.action.scripts": "Scripts",
    "home.trending": "Trending ngayon sa FB",
    "home.diskarte": "Diskarte mo ngayon",
    "home.diskarte.sub": "Pumili ng gagawin →",
    "home.tab.home": "Home",
    "home.tab.news": "Balita",
    "home.tab.new": "Bagong",
    "home.tab.scripts": "Scripts",
    "home.tab.ako": "Brand",
    // Generic
    "btn.open": "Buksan",
    "common.hot": "Hot ngayon",
  },
  english: {
    "nav.news": "Trending Now",
    "nav.home": "Dashboard",
    "nav.brand": "Brand Builder",
    "nav.content": "Content Engine",
    "nav.convert": "Conversion Kit",
    "nav.outcomes": "Outcomes",
    "page.news.sub": "What's hot in Philippine food selling.",
    "page.home.sub": "Here's what to focus on today.",
    "page.brand.sub": "Build your positioning and story.",
    "page.content.sub": "Generate captions in your voice.",
    "page.convert.sub": "Scripts for high-intent conversations.",
    "page.outcomes.sub": "Log what converted into orders.",
    "settings.title": "Settings",
    "settings.lang": "Language",
    "settings.theme": "Theme",
    "lang.taglish": "Taglish",
    "lang.english": "English",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.warm": "Warm",
    "theme.ube": "Ube",
    "theme.editorial": "Editorial",
    "home.greet.morning": "Good morning",
    "home.greet.noon": "Good noon",
    "home.greet.afternoon": "Good afternoon",
    "home.greet.evening": "Good evening",
    "home.greet.default": "Hello",
    "home.this_week": "This week",
    "home.posts_generated": "Posts generated",
    "home.scripts_generated": "Scripts generated",
    "home.action.new_post": "New post",
    "home.action.brand_setup": "Brand setup",
    "home.action.scripts": "Scripts",
    "home.trending": "Trending now on FB",
    "home.diskarte": "What to do now",
    "home.diskarte.sub": "Pick an action →",
    "home.tab.home": "Home",
    "home.tab.news": "News",
    "home.tab.new": "New",
    "home.tab.scripts": "Scripts",
    "home.tab.ako": "Brand",
    "btn.open": "Open",
    "common.hot": "Hot now",
  },
};

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "taglish";
  const v = window.localStorage.getItem(LS_KEY);
  return v === "english" ? "english" : "taglish";
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
  }

  function t(key: string): string {
    return COPY[lang][key] ?? COPY.taglish[key] ?? key;
  }

  return { lang, setLang, t };
}
