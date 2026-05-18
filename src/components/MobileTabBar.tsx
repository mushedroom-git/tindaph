import { Home, Newspaper, Plus, MessageSquare, Sparkles } from "lucide-react";

type TabId = "home" | "news" | "new" | "scripts" | "ako";

type Props = {
  active: TabId;
  onSelect: (tab: TabId) => void;
  t: (key: string) => string;
};

export default function MobileTabBar({ active, onSelect, t }: Props) {
  const tabs: { id: TabId; Icon: typeof Home; key: string }[] = [
    { id: "home", Icon: Home, key: "home.tab.home" },
    { id: "news", Icon: Newspaper, key: "home.tab.news" },
    { id: "new", Icon: Plus, key: "home.tab.new" },
    { id: "scripts", Icon: MessageSquare, key: "home.tab.scripts" },
    { id: "ako", Icon: Sparkles, key: "home.tab.ako" },
  ];

  return (
    <nav className="m-tabbar" aria-label="Bottom navigation">
      {tabs.map(({ id, Icon, key }) => {
        const isCenter = id === "new";
        const isActive = active === id;
        return (
          <button
            type="button"
            key={id}
            className={
              "m-tab" +
              (isActive ? " active" : "") +
              (isCenter ? " m-tab-center" : "")
            }
            onClick={() => onSelect(id)}
            aria-label={t(key)}
          >
            <Icon className="m-tab-icon" strokeWidth={isCenter ? 2.5 : 2} />
            {!isCenter && <span className="m-tab-label">{t(key)}</span>}
          </button>
        );
      })}
    </nav>
  );
}
