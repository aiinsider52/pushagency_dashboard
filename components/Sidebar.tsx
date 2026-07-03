"use client";

import { useState } from "react";
import { PageId } from "@/lib/nav";
import { IconBolt, IconChart, IconGrid, IconLayers, IconPulse } from "./icons";

const NAV: { id: PageId; icon: typeof IconGrid; label: string }[] = [
  { id: "overview", icon: IconGrid, label: "Огляд" },
  { id: "automation", icon: IconBolt, label: "Автоматизація" },
  { id: "pipeline", icon: IconLayers, label: "Воронка" },
  { id: "finance", icon: IconChart, label: "Фінанси" },
  { id: "activity", icon: IconPulse, label: "Активність" },
];

type SidebarProps = {
  active: PageId;
  onChange: (page: PageId) => void;
  onHelp: () => void;
};

export default function Sidebar({ active, onChange, onHelp }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop: slim + expand on hover */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`hidden lg:flex shrink-0 flex-col py-5 border-r border-border transition-all duration-300 ease-out overflow-hidden ${
          expanded ? "w-[220px] px-3" : "w-[72px] px-2 items-center"
        }`}
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className={`flex items-center gap-3 mb-8 ${expanded ? "px-2" : "justify-center"}`}>
          <div className="w-10 h-10 rounded-2xl bg-brand grid place-items-center shrink-0 shadow-soft">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          {expanded && (
            <div className="overflow-hidden whitespace-nowrap">
              <div className="font-bold text-ink text-[15px]">PushDash</div>
              <div className="text-[10px] text-muted">Orbit Control</div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 w-full">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 rounded-xl transition-all ${
                  expanded ? "px-3 py-2.5" : "p-2.5 justify-center"
                } ${isActive ? "text-brand font-semibold" : "text-muted hover:text-ink hover:bg-hover"}`}
                style={isActive ? { background: "var(--sidebar-active)" } : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onHelp}
          title="Документація"
          className={`mt-4 w-full flex items-center gap-2 rounded-xl text-xs font-medium text-muted hover:text-brand hover:bg-hover transition-colors ${
            expanded ? "px-3 py-2.5" : "p-2.5 justify-center"
          }`}
        >
          <span className="text-base">?</span>
          {expanded && <span>Допомога</span>}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-around bg-surface border border-border rounded-2xl py-2 px-1 shadow-card">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl ${isActive ? "text-brand" : "text-muted"}`}
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
