"use client";

import { useState } from "react";
import { PageId, PAGE_META } from "@/lib/nav";
import { NotificationItem } from "@/lib/notifications";
import { Avatar, Dropdown, IconBell, IconSearch, Segmented } from "./ui";
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

  return (
    <header className="flex items-center justify-between gap-4 flex-wrap mb-7">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand mb-1">Push Agency</p>
        <h1 className="text-[26px] font-extrabold text-ink leading-tight">
          {page === "overview" ? (
            <>
              Привіт, <span className="gradient-text">команда</span> 👋
            </>
          ) : (
            meta.title
          )}
        </h1>
        <p className="text-muted text-sm mt-1">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2.5 bg-surface3/60 border border-border rounded-full px-4 py-2.5 text-sm w-64 backdrop-blur-sm focus-within:border-brand/40 transition-colors">
          <IconSearch className="w-4 h-4 shrink-0 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук задачі, WF…"
            className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted/60 text-sm"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-muted hover:text-ink text-xs">
              ✕
            </button>
          )}
        </div>

        <Segmented options={["Тиждень", "Місяць", "Все"]} value={period} onChange={setPeriod} />

        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setAccountOpen(false);
            }}
            className={`relative w-10 h-10 rounded-xl border grid place-items-center transition-colors ${
              notifOpen ? "bg-brand/15 border-brand/30 text-brand" : "bg-surface3/60 border-border text-muted hover:text-ink hover:border-border-bright"
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
                <button type="button" onClick={onMarkAllRead} className="text-[11px] text-brand hover:underline">
                  Прочитати все
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto space-y-0.5">
              {notifications.length === 0 && (
                <div className="text-center text-muted text-sm py-8">Немає сповіщень</div>
              )}
              {notifications.map((n) => {
                const unreadItem = !readIds.has(n.id);
                const tone =
                  n.type === "error" ? "border-err/30 bg-err/5" : n.type === "warning" ? "border-warn/30 bg-warn/5" : "border-brand/20 bg-brand/5";
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onNotificationClick(n);
                      setNotifOpen(false);
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2.5 border transition-colors hover:border-border-bright ${tone} ${
                      unreadItem ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-ink leading-snug">{n.title}</span>
                      {unreadItem && <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted/70 mt-1 tabular-nums">
                      {n.time ? new Date(n.time).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </button>
                );
              })}
            </div>
          </Dropdown>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAccountOpen((v) => !v);
              setNotifOpen(false);
            }}
            className={`flex items-center gap-2.5 rounded-full pl-1.5 pr-3.5 py-1.5 border backdrop-blur-sm transition-colors ${
              accountOpen ? "bg-brand/10 border-brand/30" : "bg-surface3/60 border-border hover:border-border-bright"
            }`}
          >
            <Avatar name="Push Agency" size={32} />
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-ink leading-none">PM</div>
              <div className="text-[10px] text-muted mt-0.5">Pro Account</div>
            </div>
          </button>
          <Dropdown open={accountOpen} onClose={() => setAccountOpen(false)} align="right">
            <div className="px-3 py-2 border-b border-border mb-1">
              <div className="font-semibold text-ink">Push Agency</div>
              <div className="text-xs text-muted">Project Manager · Internal</div>
            </div>
            <div className="px-3 py-2 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">Джерела даних</div>
              {sources.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">{s.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.live ? "text-ok border-ok/25 bg-ok/10" : "text-warn border-warn/25 bg-warn/10"}`}>
                    {s.live ? "live" : "mock"}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-1 pt-1 space-y-0.5">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-ink">Тема</span>
                <ThemeToggle />
              </div>
              <button
                type="button"
                onClick={() => {
                  onRefresh();
                  setAccountOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-ink hover:bg-hover"
              >
                ↻ Оновити дані
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-xl text-sm text-muted hover:text-ink hover:bg-hover"
                onClick={() => setAccountOpen(false)}
              >
                Налаштування .env
              </a>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
