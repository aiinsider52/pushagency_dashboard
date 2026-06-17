"use client";

import { PageId } from "@/lib/nav";
import { IconBolt, IconChart, IconGrid, IconLayers, IconPulse } from "./icons";

const SECTIONS: {
  label: string;
  items: { id: PageId; icon: typeof IconGrid; label: string }[];
}[] = [
  {
    label: "Головне",
    items: [
      { id: "overview", icon: IconGrid, label: "Огляд" },
      { id: "automation", icon: IconBolt, label: "Автоматизація" },
    ],
  },
  {
    label: "Продакшн",
    items: [
      { id: "pipeline", icon: IconLayers, label: "Воронка" },
      { id: "finance", icon: IconChart, label: "Фінанси" },
      { id: "activity", icon: IconPulse, label: "Активність" },
    ],
  },
];

export const ALL_NAV_ITEMS = SECTIONS.flatMap((s) => s.items);

type SidebarProps = {
  active: PageId;
  onChange: (page: PageId) => void;
  onHelp: () => void;
};

export default function Sidebar({ active, onChange, onHelp }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-border bg-surface2/80 backdrop-blur-xl py-6 px-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="relative w-10 h-10 rounded-2xl bg-brand grid place-items-center shadow-glow">
            <span className="text-white text-lg font-bold">P</span>
            <span className="absolute inset-0 rounded-2xl bg-brand opacity-40 blur-md -z-10" />
          </div>
          <div>
            <div className="font-bold text-ink text-[15px] leading-tight">PushDash</div>
            <div className="text-[11px] text-muted">Automation Control</div>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted/60 px-2 mb-2">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavButton key={item.id} item={item} active={active} onSelect={onChange} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl bg-hero-kpi border border-brand/20 p-4">
          <div className="text-xs font-semibold text-ink mb-1">Потрібна допомога?</div>
          <p className="text-[11px] text-muted leading-relaxed mb-3">
            Перевір n8n executions або Central Log для діагностики.
          </p>
          <button
            type="button"
            onClick={onHelp}
            className="w-full py-2 rounded-xl bg-brand text-white text-xs font-semibold shadow-glow-sm hover:brightness-110 transition-all"
          >
            Документація
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-around bg-surface3/95 backdrop-blur-xl border border-border rounded-2xl py-2 px-1 shadow-card">
        {ALL_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                isActive ? "text-brand" : "text-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: (typeof ALL_NAV_ITEMS)[number];
  active: PageId;
  onSelect: (id: PageId) => void;
}) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? "bg-brand/15 text-brand border border-brand/25 shadow-glow-sm"
          : "text-muted hover:text-ink hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <Icon className={`w-[18px] h-[18px] ${isActive ? "text-brand" : "text-muted"}`} />
      {item.label}
    </button>
  );
}
