"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Світла тема" : "Темна тема"}
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      className="relative flex items-center w-[52px] h-[28px] rounded-full border border-border bg-surface3/80 p-0.5 transition-colors hover:border-border-bright shrink-0"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[22px] h-[22px] rounded-full bg-brand shadow-glow-sm transition-transform duration-200 ${
          isDark ? "translate-x-0" : "translate-x-[22px]"
        }`}
      />
      <span className={`relative z-[1] flex-1 grid place-items-center ${isDark ? "text-white/90" : "text-muted/50"}`}>
        <IconMoon className="w-3 h-3" />
      </span>
      <span className={`relative z-[1] flex-1 grid place-items-center ${!isDark ? "text-brand" : "text-muted/50"}`}>
        <IconSun className="w-3 h-3" />
      </span>
    </button>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 14.5A8.5 8.5 0 1111.5 4a6.5 6.5 0 109.5 10.5z" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}
