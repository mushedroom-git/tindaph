import { ArrowRight, Sparkles, Compass, MessageSquare, TrendingUp } from "lucide-react";

type TrendItem = {
  id: number;
  categoryLabel: string;
  headline: string;
};

type Props = {
  t: (key: string) => string;
  userName: string;
  postsGenerated: number;
  scriptsGenerated: number;
  brandSaved: boolean;
  brandProgress?: { done: number; total: number };
  trending: TrendItem[];
  onPrimary: () => void;
  onShortcut: (key: "caption" | "brand" | "reply") => void;
  onOpenNews: () => void;
  onNewPost: () => void;
  onScripts: () => void;
};

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 11) return "home.greet.morning";
  if (h < 13) return "home.greet.noon";
  if (h < 18) return "home.greet.afternoon";
  return "home.greet.evening";
}

export default function MobileHero({
  t,
  userName,
  postsGenerated,
  scriptsGenerated,
  brandSaved,
  brandProgress = { done: 0, total: 6 },
  trending,
  onPrimary,
  onShortcut,
  onOpenNews,
  onNewPost,
  onScripts,
}: Props) {
  const showStats = postsGenerated + scriptsGenerated > 0;
  const total = brandProgress.total || 6;
  const done = Math.min(brandProgress.done, total);

  return (
    <div className="m-home">
      <div className="m-greet">
        <span className="m-greet-line">{t(greetingKey())},</span>{" "}
        <span className="m-greet-name">{userName}</span>
      </div>

      <article className="m-action-card">
        <div className="m-action-eyebrow">
          <span className="m-action-dot" /> Today
        </div>
        <h2 className="m-action-title">
          {brandSaved
            ? "Post a Tuesday merienda teaser by 4 PM"
            : "Tapusin ang Brand Builder — 6 quick tanong"}
        </h2>
        <p className="m-action-sub">
          {brandSaved
            ? "Tuesdays 3–5 PM is your top engagement window. Use your 'lola's recipe' angle and end with a question."
            : "~2 minutes. Pagkatapos, every caption and script will sound like you."}
        </p>
        <div className="m-action-foot">
          <button type="button" className="m-action-btn" onClick={onPrimary}>
            {brandSaved ? "Open Content Engine" : "Simulan"}
            <ArrowRight size={16} strokeWidth={2.25} />
          </button>
          {!brandSaved && (
            <div className="m-action-progress" aria-label={`${done} of ${total}`}>
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className={i < done ? "m-prog-dot done" : "m-prog-dot"}
                />
              ))}
            </div>
          )}
        </div>
      </article>

      {showStats && (
        <article className="m-stats-card">
          <div className="m-stats-row">
            <div className="m-stats-item">
              <div className="m-stats-value">{postsGenerated}</div>
              <div className="m-stats-label">{t("home.posts_generated")}</div>
            </div>
            <div className="m-stats-vr" />
            <div className="m-stats-item">
              <div className="m-stats-value">{scriptsGenerated}</div>
              <div className="m-stats-label">{t("home.scripts_generated")}</div>
            </div>
          </div>
          <div className="m-stats-actions">
            <button type="button" className="m-stats-pill" onClick={onNewPost}>
              <Sparkles size={13} strokeWidth={2.25} /> Bagong post
            </button>
            <button type="button" className="m-stats-pill ghost" onClick={onScripts}>
              <MessageSquare size={13} strokeWidth={2.25} /> Scripts
            </button>
          </div>
        </article>
      )}

      <div className="m-section-label">Mga shortcut</div>
      <div className="m-shortcut-grid">
        <button type="button" className="m-shortcut-tile" onClick={() => onShortcut("caption")}>
          <Sparkles size={20} strokeWidth={1.75} />
          <span>Caption</span>
        </button>
        <button type="button" className="m-shortcut-tile" onClick={() => onShortcut("brand")}>
          <Compass size={20} strokeWidth={1.75} />
          <span>Brand</span>
        </button>
        <button type="button" className="m-shortcut-tile" onClick={() => onShortcut("reply")}>
          <MessageSquare size={20} strokeWidth={1.75} />
          <span>Reply</span>
        </button>
      </div>

      {trending.length > 0 && (
        <>
          <div className="m-section-label m-section-label-row">
            <span>
              <TrendingUp size={13} strokeWidth={2} /> Trending sa FB ngayon
            </span>
            <button type="button" className="m-section-link" onClick={onOpenNews}>
              See all
            </button>
          </div>
          <div className="m-trend-strip">
            {trending.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                className="m-trend-card"
                onClick={onOpenNews}
              >
                <div className="m-trend-cat">{item.categoryLabel}</div>
                <div className="m-trend-head">{item.headline}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
