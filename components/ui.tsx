"use client";

import React, { useEffect, useRef, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export function Card({
  title,
  right,
  children,
  className = "",
  glow = false,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`glass-card p-6 transition-shadow hover:shadow-card-hover ${glow ? "shadow-glow-sm" : ""} ${className}`}
    >
      {(title || right) && (
        <div className="relative flex items-center justify-between mb-5 z-[1]">
          {title && (
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-[0.12em]">{title}</h3>
          )}
          {right}
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

const TONES: Record<string, { chip: string; ring: string; glow: string }> = {
  brand: { chip: "bg-brand/15 text-brand border-brand/20", ring: "from-brand via-brand2 to-pink", glow: "shadow-glow-sm" },
  ok: { chip: "bg-ok/12 text-ok border-ok/20", ring: "from-ok to-sky", glow: "shadow-glow-ok" },
  warn: { chip: "bg-warn/12 text-warn border-warn/20", ring: "from-warn to-accent", glow: "" },
  err: { chip: "bg-err/12 text-err border-err/20", ring: "from-err to-pink", glow: "shadow-glow-err" },
};

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = "brand",
  sparkline,
  featured = false,
  delta,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "brand" | "ok" | "warn" | "err";
  sparkline?: { day: string; v: number }[];
  featured?: boolean;
  delta?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      className={`relative rounded-2xl p-5 overflow-hidden border transition-all hover:shadow-card-hover ${
        featured
          ? "bg-hero-kpi border-brand/30 shadow-glow-sm"
          : "glass-card border-border"
      } ${t.glow}`}
    >
      {!featured && <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${t.ring} opacity-60`} />}
      <div className="relative z-[1]">
        <div className="flex items-start justify-between">
          <div className="text-[11px] text-muted font-medium uppercase tracking-wide">{label}</div>
          {icon && (
            <div className={`w-9 h-9 rounded-xl grid place-items-center border ${t.chip}`}>{icon}</div>
          )}
        </div>
        <div className="flex items-end gap-2 mt-2">
          <div className="text-[32px] leading-none font-extrabold text-ink tabular-nums">{value}</div>
          {delta}
        </div>
        {sub && <div className="text-[12px] text-muted mt-1.5">{sub}</div>}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-3 h-10 -mx-1 opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline}>
                <defs>
                  <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tone === "ok" ? "#34d399" : tone === "err" ? "#f87171" : "#8b7bff"} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={tone === "ok" ? "#34d399" : tone === "err" ? "#f87171" : "#8b7bff"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={tone === "ok" ? "#34d399" : tone === "err" ? "#f87171" : "#8b7bff"}
                  strokeWidth={1.5}
                  fill={`url(#spark-${tone})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

const AV_GRADS = [
  "from-[#8b7bff] to-[#b35cff]",
  "from-[#ff5ca8] to-[#ff7a45]",
  "from-[#5eb8ff] to-[#34d399]",
  "from-[#34d399] to-[#5eb8ff]",
  "from-[#fbbf24] to-[#ff5ca8]",
];

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name
    .split(/[\s:]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AV_GRADS.length;
  return (
    <span
      className={`inline-grid place-items-center rounded-full text-white font-semibold bg-gradient-to-br ${AV_GRADS[h]} ring-2 ring-white/10`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "?"}
    </span>
  );
}

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
        up ? "bg-ok/10 text-ok border-ok/20" : "bg-err/10 text-err border-err/20"
      }`}
    >
      {up ? "↑" : "↓"} {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-surface3/80 rounded-full p-1 border border-border">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
            value === o
              ? "bg-brand text-white shadow-glow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Badge({ result }: { result: string }) {
  const map: Record<string, string> = {
    success: "bg-ok/12 text-ok border-ok/25",
    warning: "bg-warn/12 text-warn border-warn/25",
    error: "bg-err/12 text-err border-err/25",
  };
  const cls = map[result] ?? "bg-white/5 text-muted border-border";
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${cls}`}>
      {result || "—"}
    </span>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-white/[0.04] border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white/[0.04] border border-border" />
        <div className="h-72 rounded-2xl bg-white/[0.04] border border-border" />
      </div>
    </div>
  );
}

function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);
  return ref;
}

export function Dropdown({
  open,
  onClose,
  align = "right",
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`absolute top-[calc(100%+8px)] z-50 min-w-[280px] rounded-2xl border border-border bg-surface3/95 backdrop-blur-xl shadow-card p-2 animate-fade-up ${
        align === "right" ? "right-0" : "left-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={ref}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface3 shadow-card p-6 animate-fade-up"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-white/5"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
