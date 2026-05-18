import { useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles, Image as ImageIcon, FileText, Camera, Download, FileDown } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

type PaletteColor = { name: string; role: string; hex: string };

export type PostingDay = { day: string; abbr: string; contentType: string; tip: string };
export type WeeklyRhythm = { postsPerWeek: number; schedule: PostingDay[] };
export type VoiceRules = { useWords: string[]; avoidWords: string[]; example: string };

export type BrandRevealProfile = {
  businessName: string;
  tagline: string;
  oneLiner: string;
  targetBuyer: string;
  uniqueValue: string;
  brandVoice: string;
  emotionalHook: string;
  contentTip: string;
  photographyMood: string;
  palette: PaletteColor[];
  heroImage?: string | null;
  weeklyRhythm?: WeeklyRhythm;
  voiceRules?: VoiceRules;
};

type Props = {
  profile: BrandRevealProfile;
  visualStyleName?: string;
  onGeneratePosts: () => void;
  onCreateCover?: () => void;
  onCreateMenu?: () => void;
  onCreatePhotoPrompts?: () => void;
};

// Emotional one-word feelings per palette role
const ROLE_FEELING: Record<string, string> = {
  Primary: "feels grounded",
  Secondary: "feels warm",
  Background: "feels calm",
  Accent: "feels alive",
  Neutral: "feels handmade",
};

// Derive 3-5 personality chips from brandVoice text
function deriveChips(voice: string): string[] {
  const tokens = voice
    .split(/[,/&]| and | at /i)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (!seen.has(t)) { seen.add(t); out.push(t); }
    if (out.length >= 4) break;
  }
  return out.length ? out : ["Warm", "Caring", "Honest"];
}

// First sentence as the "main emotional headline"
function firstSentence(text: string, max = 80): string {
  const m = text.match(/[^.!?]+[.!?]?/);
  const s = (m ? m[0] : text).trim();
  return s.length > max ? s.slice(0, max - 1).trim() + "…" : s;
}

export default function BrandReveal({
  profile,
  visualStyleName,
  onGeneratePosts,
  onCreateCover,
  onCreateMenu,
  onCreatePhotoPrompts,
}: Props) {
  const p = profile;
  const primary = p.palette[0]?.hex ?? "#8B4513";
  const secondary = p.palette[1]?.hex ?? "#A0522D";
  const accent = p.palette[3]?.hex ?? p.palette[2]?.hex ?? "#556B2F";
  const bg = p.palette.find((c) => c.role === "Background")?.hex ?? "#F5F5DC";
  const neutral = p.palette[4]?.hex ?? "#D2B48C";

  const chips = useMemo(() => deriveChips(p.brandVoice), [p.brandVoice]);
  const insightHeadline = useMemo(() => firstSentence(p.emotionalHook, 70), [p.emotionalHook]);

  const revealRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadImage() {
    if (!revealRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(revealRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${p.businessName}-brand.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  async function downloadPdf() {
    if (!revealRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(revealRef.current, { quality: 0.95, pixelRatio: 2 });
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;
      const totalH = contentW * (img.height / img.width);
      let yOffset = 0;
      while (yOffset < totalH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(dataUrl, "PNG", margin, margin - yOffset, contentW, totalH);
        yOffset += contentH;
      }
      pdf.save(`${p.businessName}-brand.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  const styles: React.CSSProperties = {
    // CSS variables scoped to this component
    ["--br-primary" as any]: primary,
    ["--br-secondary" as any]: secondary,
    ["--br-accent" as any]: accent,
    ["--br-bg" as any]: bg,
    ["--br-neutral" as any]: neutral,
  };

  return (
    <>
      {/* DOWNLOAD BAR — outside capture ref so it doesn't appear in exports */}
      <div className="br-download-bar">
        <span className="br-download-bar-label">Save your brand kit</span>
        <div className="br-download-bar-actions">
          <button type="button" className="br-btn-download" onClick={downloadImage} disabled={downloading}>
            <Download size={14} /> {downloading ? "Generating…" : "Image"}
          </button>
          <button type="button" className="br-btn-download" onClick={downloadPdf} disabled={downloading}>
            <FileDown size={14} /> {downloading ? "Generating…" : "PDF"}
          </button>
        </div>
      </div>

      <div className="brand-reveal" style={styles} ref={revealRef}>
      {/* 1. HERO REVEAL */}
      <section className="br-hero">
        <div
          className="br-hero-image"
          style={{
            backgroundImage: p.heroImage ? `url(${p.heroImage})` : undefined,
            backgroundColor: !p.heroImage ? primary : undefined,
          }}
        >
          <div className="br-hero-overlay" />
          <div className="br-hero-content">
            <div className="br-hero-eyebrow">
              <Sparkles size={14} /> Your brand identity
            </div>
            <h1 className="br-hero-name">{p.businessName}</h1>
            <p className="br-hero-headline">"{insightHeadline}"</p>
            <p className="br-hero-tagline">{p.tagline}</p>

            <div className="br-chip-row">
              {chips.map((c) => (
                <span key={c} className="br-chip">{c}</span>
              ))}
            </div>

            <div className="br-cta-row">
              <button type="button" className="br-btn br-btn-primary" onClick={onGeneratePosts}>
                Generate my first posts <ArrowRight size={16} />
              </button>
              {onCreateCover && (
                <button type="button" className="br-btn br-btn-ghost" onClick={onCreateCover}>
                  Create Facebook cover
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <div className="br-value-prop">
        <div className="br-value-prop-label">Value Proposition</div>
        <p className="br-value-prop-text">{p.oneLiner}</p>
      </div>

      {/* 2. CUSTOMER INSIGHT */}
      <section className="br-section">
        <div className="br-section-eyebrow">Why customers choose you</div>
        <div className="br-insight-card">
          <p className="br-insight-sub">{p.emotionalHook}</p>
        </div>

        <div className="br-beforeafter">
          <div className="br-ba-card br-ba-before">
            <div className="br-ba-emoji">😩</div>
            <div className="br-ba-label">Before</div>
            <div className="br-ba-text">"Pagod na ako, walang oras magluto."</div>
          </div>
          <div className="br-ba-arrow" aria-hidden>→</div>
          <div className="br-ba-card br-ba-after">
            <div className="br-ba-emoji">😊</div>
            <div className="br-ba-label">After {p.businessName}</div>
            <div className="br-ba-text">"May mainit na lutong bahay na naghihintay."</div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL BRAND BOARD */}
      <section className="br-section">
        <div className="br-section-eyebrow">Your brand look</div>
        <h2 className="br-section-title">A mood, not just colors.</h2>

        <div className="br-board">
          {p.palette.map((c) => (
            <div className="br-swatch" key={`${c.role}-${c.hex}`}>
              <div className="br-swatch-color" style={{ background: c.hex }} />
              <div className="br-swatch-meta">
                <div className="br-swatch-name">{c.name}</div>
                <div className="br-swatch-feel">{ROLE_FEELING[c.role] ?? c.role.toLowerCase()}</div>
                <div className="br-swatch-hex">{c.hex}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="br-type-grid">
          <div className="br-type-card">
            <div className="br-type-label">Headline font</div>
            <div className="br-type-display" style={{ color: primary }}>{p.businessName}</div>
            <div className="br-type-meta">Serif · for emotion & heritage</div>
          </div>
          <div className="br-type-card">
            <div className="br-type-label">Caption font</div>
            <div className="br-type-body">"{p.tagline}"</div>
            <div className="br-type-meta">Sans · for clear, friendly captions</div>
          </div>
          <div className="br-type-card br-type-photo">
            <div className="br-type-label">Photography</div>
            <div className="br-type-body">{p.photographyMood}</div>
            <div className="br-type-meta">{visualStyleName ?? "Visual style"}</div>
          </div>
        </div>
      </section>

      {/* 4. WHAT MAKES YOU DIFFERENT */}
      <section className="br-section">
        <div className="br-section-eyebrow">What makes you different</div>
        <div className="br-vs">
          <div className="br-vs-col br-vs-them">
            <div className="br-vs-title">Other sellers</div>
            <ul>
              <li>Fast meals</li>
              <li>Generic recipes</li>
              <li>Promo-focused captions</li>
              <li>Food that fills the stomach</li>
            </ul>
          </div>
          <div className="br-vs-col br-vs-you">
            <div className="br-vs-title">{p.businessName}</div>
            <ul>
              <li>{p.uniqueValue}</li>
              <li>Voice: {p.brandVoice}</li>
              <li>For: {p.targetBuyer}</li>
              <li>Food that feels like home</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. FACEBOOK PREVIEW STUDIO */}
      <section className="br-section">
        <div className="br-section-eyebrow">Facebook preview studio</div>
        <h2 className="br-section-title">How your brand can look on Facebook.</h2>

        <div className="br-fb-grid">
          {/* FB Post */}
          <div className="br-fb-card br-fb-post">
            <div className="br-fb-header">
              <div className="br-fb-avatar" style={{ background: primary }}>
                {p.businessName.charAt(0)}
              </div>
              <div>
                <div className="br-fb-name">{p.businessName}</div>
                <div className="br-fb-time">Just now · 🌐</div>
              </div>
            </div>
            <div className="br-fb-caption">
              {p.contentTip || `Pagod ka na sa work? Kami na bahala sa dinner tonight. Mainit, bagong luto, at lasang bahay.`}
            </div>
            <div
              className="br-fb-image"
              style={{
                backgroundImage: p.heroImage ? `url(${p.heroImage})` : undefined,
                backgroundColor: !p.heroImage ? secondary : undefined,
              }}
            >
              {!p.heroImage && <ImageIcon size={32} opacity={0.4} />}
            </div>
            <div className="br-fb-footer">👍 ❤️ 🔥 · 142 reactions</div>
          </div>

          {/* FB Cover — authentic Facebook page header */}
          <div className="br-fb-card br-fb-cover-card">
            <div className="br-fb-mini-label">Facebook page cover</div>
            <div className="br-fb-page">
              <div
                className="br-fb-cover"
                style={
                  p.heroImage
                    ? { backgroundImage: `url(${p.heroImage})` }
                    : { background: `linear-gradient(135deg, ${primary}, ${secondary} 60%, ${accent})` }
                }
              >
                <div className="br-fb-cover-shade" />
              </div>
              <div className="br-fb-page-info">
                <div className="br-fb-page-pic" style={{ background: primary }}>
                  {p.businessName.charAt(0)}
                </div>
                <div className="br-fb-page-meta">
                  <div className="br-fb-page-name">{p.businessName}</div>
                  <div className="br-fb-page-handle">@{p.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "")}</div>
                  <div className="br-fb-page-tag">{p.tagline}</div>
                  <div className="br-fb-page-actions">
                    <span className="br-fb-page-btn br-fb-page-btn-primary">＋ Like</span>
                    <span className="br-fb-page-btn">Message</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu card */}
          <div className="br-fb-card br-fb-menu">
            <div className="br-fb-mini-label">Menu card</div>
            <div className="br-menu-inner">
              <div className="br-menu-ornament">est. today</div>
              <div className="br-menu-title" style={{ color: primary }}>{p.businessName}</div>
              <div className="br-menu-tag">— {p.tagline} —</div>
              <div className="br-menu-divider" />
              <div className="br-menu-section">Mga Paborito</div>
              <div className="br-menu-line"><span>Lutong Bahay Set</span><span>₱180</span></div>
              <div className="br-menu-line"><span>Family Bilao</span><span>₱650</span></div>
              <div className="br-menu-line"><span>Pang-Merienda</span><span>₱120</span></div>
              <div className="br-menu-section">Panghimagas</div>
              <div className="br-menu-line"><span>Leche Flan</span><span>₱75</span></div>
              <div className="br-menu-foot">salamat sa pagkain kasama namin</div>
            </div>
          </div>

          {/* Story — phone mockup */}
          <div className="br-fb-card br-fb-story">
            <div className="br-fb-mini-label">Story / Reel cover</div>
            <div className="br-phone">
              <div className="br-phone-notch" />
              <div
                className="br-story"
                style={
                  p.heroImage
                    ? { backgroundImage: `url(${p.heroImage})` }
                    : { background: `linear-gradient(180deg, ${secondary}, ${primary})` }
                }
              >
                <div className="br-story-overlay" />
                <div className="br-story-top">
                  <div className="br-story-bar" />
                  <div className="br-story-bar br-story-bar-dim" />
                  <div className="br-story-bar br-story-bar-dim" />
                </div>
                <div className="br-story-avatar">
                  <div className="br-story-avatar-dot">{p.businessName.charAt(0)}</div>
                  <span>{p.businessName}</span>
                  <span className="br-story-time">2h</span>
                </div>
                <div className="br-story-text">
                  <div className="br-story-eyebrow">Today's special</div>
                  <div className="br-story-line">Mainit-init pa,<br/>bagong luto.</div>
                  <div className="br-story-cta" style={{ background: primary }}>Order na →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTENT STARTERS */}
      <section className="br-section">
        <div className="br-section-eyebrow">What you should post</div>
        <div className="br-starters">
          {[
            { icon: "🍲", title: "Comfort meals", caption: "Pagod ka na? May lutong bahay na naghihintay." },
            { icon: "👵", title: "Founder stories", caption: p.emotionalHook.slice(0, 90) + (p.emotionalHook.length > 90 ? "…" : "") },
            { icon: "🔥", title: "Cooking moments", caption: "Freshly cooked this morning. Mainit-init pa." },
            { icon: "❤️", title: "Customer memories", caption: "Salamat sa tiwala. Hatid namin ay lasa ng bahay." },
          ].map((s) => (
            <div key={s.title} className="br-starter">
              <div className="br-starter-icon">{s.icon}</div>
              <div className="br-starter-title">{s.title}</div>
              <div className="br-starter-caption">"{s.caption}"</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WEEKLY POSTING RHYTHM */}
      {(() => {
        const rhythm: WeeklyRhythm = p.weeklyRhythm ?? {
          postsPerWeek: 3,
          schedule: [
            { day: "Monday", abbr: "Mon", contentType: "Product story", tip: `Share the story behind today's dish` },
            { day: "Wednesday", abbr: "Wed", contentType: "Customer reaction", tip: `Post a buyer message or feedback` },
            { day: "Friday", abbr: "Fri", contentType: "Weekend promo", tip: `Open pre-orders with a limited-slot hook` },
          ],
        };
        return (
          <section className="br-section">
            <div className="br-section-eyebrow">Weekly posting rhythm</div>
            <h2 className="br-section-title">
              {rhythm.postsPerWeek} posts a week. Consistent presence, zero burnout.
            </h2>
            <div className="br-rhythm-header">
              <span className="br-rhythm-count">{rhythm.postsPerWeek}</span>
              <span className="br-rhythm-label">posts / week recommended for your brand type</span>
            </div>
            <div className="br-rhythm-grid">
              {rhythm.schedule.map((day) => (
                <div key={day.abbr} className="br-rhythm-day">
                  <div className="br-rhythm-abbr">{day.abbr}</div>
                  <div className="br-rhythm-type">{day.contentType}</div>
                  <div className="br-rhythm-tip">{day.tip}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* 8. BRAND VOICE RULES */}
      {(() => {
        const voice: VoiceRules = p.voiceRules ?? {
          useWords: ["kain na", "lutong bahay", "sariwang gawa", "pampamilya", "sulit"],
          avoidWords: ["premium", "world-class", "order now"],
          example: `Pre-order na bago maubusan — limited slots lang kami ngayon.`,
        };
        return (
          <section className="br-section">
            <div className="br-section-eyebrow">Brand voice rules</div>
            <h2 className="br-section-title">Words that sound like you.</h2>
            <div className="br-voice-grid">
              <div className="br-voice-col br-voice-use">
                <div className="br-voice-col-label">✅ Use often</div>
                <ul className="br-voice-list">
                  {voice.useWords.map((w) => (
                    <li key={w} className="br-voice-item">{w}</li>
                  ))}
                </ul>
              </div>
              <div className="br-voice-col br-voice-avoid">
                <div className="br-voice-col-label">🚫 Avoid</div>
                <ul className="br-voice-list">
                  {voice.avoidWords.map((w) => (
                    <li key={w} className="br-voice-item">{w}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="br-voice-example">
              <div className="br-voice-example-label">Your brand voice in action</div>
              <p className="br-voice-example-text">"{voice.example}"</p>
            </div>
          </section>
        );
      })()}

      {/* 9. BRAND DNA SUMMARY */}
      <section className="br-section">
        <div className="br-section-eyebrow">Your brand DNA</div>
        <div className="br-dna">
          <div className="br-dna-header">
            <div className="br-dna-stamp">Brand identity card · 01 / 01</div>
            <h3 className="br-dna-headline">
              {p.businessName} is a brand that <em>{chips[0]?.toLowerCase() ?? "feels"}</em>, sounds <em>{chips[1]?.toLowerCase() ?? "warm"}</em>, and looks like <em>{(visualStyleName ?? "home").toLowerCase()}</em>.
            </h3>
          </div>
          <div className="br-dna-grid">
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">Personality</div>
              <div className="br-dna-cell-chips">
                {chips.map((c) => <span key={c} className="br-dna-chip">{c}</span>)}
              </div>
            </div>
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">Color story</div>
              <div className="br-dna-cell-swatches">
                {p.palette.slice(0, 5).map((c) => (
                  <div key={c.hex} className="br-dna-swatch" style={{ background: c.hex }} title={c.name} />
                ))}
              </div>
              <div className="br-dna-cell-val" style={{ fontSize: 13, opacity: 0.85 }}>
                {p.palette[0]?.name ?? "Warm"} · {p.palette[1]?.name ?? "Earthy"} · {p.palette[3]?.name ?? "Fresh"}
              </div>
            </div>
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">Voice</div>
              <div className="br-dna-cell-val">"{p.brandVoice}"</div>
            </div>
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">For</div>
              <div className="br-dna-cell-val">{p.targetBuyer}</div>
            </div>
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">Difference</div>
              <div className="br-dna-cell-val">{p.uniqueValue}</div>
            </div>
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">Positioning</div>
              <div className="br-dna-cell-val">{p.oneLiner}</div>
            </div>
            <div className="br-dna-cell">
              <div className="br-dna-cell-key">Visual mood</div>
              <div className="br-dna-cell-val">{visualStyleName ?? "Homey & natural"}</div>
              <div className="br-dna-cell-val" style={{ fontSize: 12, opacity: 0.75, fontStyle: "italic" }}>
                {p.photographyMood}
              </div>
            </div>
          </div>
          <div className="br-dna-foot">
            <span>Issued by tinda.ph</span>
            <span>One of one</span>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="br-final">
        <div className="br-final-eyebrow">The brand is ready</div>
        <h2 className="br-final-title">
          Now let's turn <em>{p.businessName}</em> into content.
        </h2>
        <p className="br-final-sub">
          Posts, menus, covers, and stories — all in your brand's voice and look. Pick where to start.
        </p>
        <div className="br-final-actions">
          <button type="button" className="br-btn br-btn-primary br-btn-lg" onClick={onGeneratePosts}>
            <FileText size={16} /> Generate 5 Facebook posts
          </button>
          {onCreateMenu && (
            <button type="button" className="br-btn br-btn-outline" onClick={onCreateMenu}>
              Create menu design
            </button>
          )}
          {onCreateCover && (
            <button type="button" className="br-btn br-btn-outline" onClick={onCreateCover}>
              <ImageIcon size={16} /> Create Facebook cover
            </button>
          )}
          {onCreatePhotoPrompts && (
            <button type="button" className="br-btn br-btn-outline" onClick={onCreatePhotoPrompts}>
              <Camera size={16} /> Product photo prompts
            </button>
          )}
        </div>
        <div className="br-final-meta">
          <span>Brand · {p.businessName}</span>
          <span>{chips.join(" · ")}</span>
          <span>Made with tinda.ph</span>
        </div>
      </section>
    </div>
    </>
  );
}
