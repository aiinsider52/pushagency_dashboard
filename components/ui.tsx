"use client";

import React, { useEffect, useRef, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`orbit-card p-6 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-5">
          {title && (
            <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

type KpiVariant = "blue" | "mint" | "lavender" | "peach";

const KPI_STYLES: Record<KpiVariant, { bg: string; icon: string; accent: string }> = {
  blue: { bg: "bg-tint-blue", icon: "bg-sky/15 text-sky", accent: "#2d9cdb" },
  mint: { bg: "bg-tint-mint", icon: "bg-ok/15 text-ok", accent: "#27ae60" },
  lavender: { bg: "bg-tint-lavender", icon: "bg-brand/15 text-brand", accent: "#9b51e0" },
  peach: { bg: "bg-tint-peach", icon: "bg-coral/15 text-coral", accent: "#ff7a5c" },
};

export function KpiCard({
  label,
  value,
  sub,
  icon,
  variant = "blue",
  delta,
  sparkline,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  variant?: KpiVariant;
  delta?: React.ReactNode;
  sparkline?: { day: string; v: number }[];
}) {
  const s = KPI_STYLES[variant];
  return (
    <div className={`${s.bg} rounded-[20px] p-5 border border-border/50 transition-shadow hover:shadow-card-hover`}>
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${s.icon}`}>
            {icon}
          </div>
        )}
        {delta && <div className="ml-auto">{delta}</div>}
      </div>
      <div className="mt-3">
        <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">{label}</div>
        <div className="text-[32px] font-extrabold text-ink leading-none mt-1 tabular-nums">{value}</div>
        {sub && <div className="text-[12px] text-muted mt-1.5">{sub}</div>}
      </div>
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 h-9 -mx-1 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient id={`kpi-${variant}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={s.accent} strokeWidth={1.5} fill={`url(#kpi-${variant})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/** @deprecated use KpiCard */
export function Stat(props: Parameters<typeof KpiCard>[0] & { tone?: string; featured?: boolean }) {
  const variantMap: Record<string, KpiVariant> = { brand: "lavender", ok: "mint", warn: "peach", err: "peach" };
  return <KpiCard {...props} variant={variantMap[props.tone ?? "brand"] ?? "blue"} />;
}

const AV_COLORS = ["#5b4fe8", "#9b51e0", "#2d9cdb", "#27ae60", "#ff7a5c"];

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(/[\s:]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AV_COLORS.length;
  return (
    <span
      className="inline-grid place-items-center rounded-full text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: AV_COLORS[h] }}
    >
      {initials || "?"}
    </span>
  );
}

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${up ? "bg-ok/12 text-ok" : "bg-err/12 text-err"}`}>
      {up ? "↑" : "↓"} {Math.abs(value)}{suffix}
    </span>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex bg-surface3 rounded-full p-1 border border-border">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${value === o ? "bg-brand text-white shadow-soft" : "text-muted hover:text-ink"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Badge({ result }: { result: string }) {
  const map: Record<string, string> = {
    success: "bg-ok/12 text-ok",
    warning: "bg-warn/12 text-warn",
    error: "bg-err/12 text-err",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${map[result] ?? "bg-track text-muted"}`}>
      {result || "—"}
    </span>
  );
}

export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={`w-2 h-2 rounded-full ${live ? "bg-ok animate-pulse" : "bg-warn"}`} />
      {live ? "live" : "mock"}
    </span>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-[20px] shimmer border border-border/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-[20px] shimmer border border-border/50" />
        <div className="h-72 rounded-[20px] shimmer border border-border/50" />
      </div>
    </div>
  );
}

function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open, onClose]);
  return ref;
}

export function Dropdown({ open, onClose, align = "right", children, className = "" }: { open: boolean; onClose: () => void; align?: "left" | "right"; children: React.ReactNode; className?: string }) {
  const ref = useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div ref={ref} className={`absolute top-[calc(100%+8px)] z-50 min-w-[280px] rounded-[16px] border border-border bg-surface shadow-card p-2 animate-fade-up ${align === "right" ? "right-0" : "left-0"} ${className}`}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-ink/40 backdrop-blur-sm">
      <div ref={ref} className="w-full max-w-lg rounded-[20px] border border-border bg-surface shadow-card p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl grid place-items-center text-muted hover:text-ink hover:bg-hover">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
