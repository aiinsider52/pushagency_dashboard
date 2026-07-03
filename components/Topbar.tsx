"use client";

import { useState } from "react";
import { PageId, PAGE_META } from "@/lib/nav";
import { NotificationItem } from "@/lib/notifications";
import { Avatar, Dropdown, IconBell, IconSearch, LiveDot, Segmented } from "./ui";
import ThemeToggle from "./ThemeToggle";

type TopbarProps = {
  page: PageId;
  period: string;
  setPeriod: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  notifications: NotificationItem[];
  readIds: Set<string>;
  onMarkAllRead: () => void;
  onNotificationClick: (n: NotificationItem) => void;
  sources: { name: string; live: boolean }[];
  onRefresh: () => void;
};

export default function Topbar({
  page,
  period,
  setPeriod,
  search,
  setSearch,
  notifications,
  readIds,
  onMarkAllRead,
  onNotificationClick,
  sources,
  onRefresh,
}: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const meta = PAGE_META[page];
  const unread = notifications.filter((n) => !readIds.has(n.id)).length;
  const allLive = sources.every((s) => s.live);

  return (
    <header className="flex items-center justify-between gap-4 flex-wrap mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-[28px] font-extrabold text-ink leading-tight tracking-tight">{meta.title}</h1>
          <LiveDot live={allLive} />
        </div>
        <p className="text-muted text-sm">Push Agency · {meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2.5 bg-surface3 border border-border rounded-full px-4 py-2.5 w-56 focus-within:border-brand/30 transition-colors shadow-soft">
          <IconSearch className="w-4 h-4 shrink-0 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук…"
            className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted/50 text-sm"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-muted hover:text-ink text-xs">✕</button>
          )}
        </div>

        <Segmented options={["Тиждень", "Місяць", "Все"]} value={period} onChange={setPeriod} />
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => { setNotifOpen((v) => !v); setAccountOpen(false); }}
            className={`relative w-10 h-10 rounded-xl border grid place-items-center transition-colors ${
              notifOpen ? "bg-brand/10 border-brand/25 text-brand" : "bg-surface border-border text-muted hover:text-ink"
            }`}
          >
            <IconBell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-err text-white text-[10px] font-bold grid place-items-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <Dropdown open={notifOpen} onClose={() => setNotifOpen(false)} align="right" className="max-w-[360px]">
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <span className="text-sm font-semibold text-ink">Сповіщення</span>
              {unread > 0 && (
                <button type="button" onClick={onMarkAllRead} className="text-[11px] text-brand hover:underline">Прочитати все</button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto space-y-1">
              {notifications.length === 0 && <div className="text-center text-muted text-sm py-8">Немає сповіщень</div>}
              {notifications.map((n) => {
                const unreadItem = !readIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { onNotificationClick(n); setNotifOpen(false); }}
                    className={`w-full text-left rounded-xl px-3 py-2.5 border border-border hover:bg-hover transition-colors ${unreadItem ? "" : "opacity-50"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-ink leading-snug">{n.title}</span>
                      {unreadItem && <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  </button>
                );
              })}
            </div>
          </Dropdown>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setAccountOpen((v) => !v); setNotifOpen(false); }}
            className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border transition-colors ${
              accountOpen ? "bg-brand/10 border-brand/25" : "bg-surface border-border hover:border-border-bright"
            }`}
          >
            <Avatar name="Push Agency" size={32} />
            <span className="hidden sm:block text-sm font-semibold text-ink">PM</span>
          </button>
          <Dropdown open={accountOpen} onClose={() => setAccountOpen(false)} align="right">
            <div className="px-3 py-2 border-b border-border mb-1">
              <div className="font-semibold text-ink">Push Agency</div>
              <div className="text-xs text-muted">Project Manager</div>
            </div>
            <div className="px-3 py-2 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">Джерела</div>
              {sources.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">{s.name}</span>
                  <LiveDot live={s.live} />
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-1 pt-1 space-y-0.5">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-ink">Тема</span>
                <ThemeToggle />
              </div>
              <button type="button" onClick={() => { onRefresh(); setAccountOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-ink hover:bg-hover">
                ↻ Оновити дані
              </button>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
