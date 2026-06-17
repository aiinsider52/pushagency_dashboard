import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        surface2: "var(--color-surface2)",
        surface3: "var(--color-surface3)",
        border: "var(--color-border)",
        "border-bright": "var(--color-border-bright)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        hover: "var(--color-hover)",
        track: "var(--color-track)",
        brand: "#8b7bff",
        brand2: "#b35cff",
        accent: "#ff7a45",
        pink: "#ff5ca8",
        ok: "#34d399",
        warn: "#fbbf24",
        err: "#f87171",
        sky: "#5eb8ff",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        glow: "var(--shadow-glow)",
        "glow-sm": "var(--shadow-glow-sm)",
        "glow-ok": "0 0 24px rgba(52,211,153,0.25)",
        "glow-err": "0 0 24px rgba(248,113,113,0.25)",
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #8b7bff 0%, #b35cff 45%, #ff5ca8 100%)",
        "brand-soft": "linear-gradient(135deg, rgba(139,123,255,0.18), rgba(255,92,168,0.12))",
        "hero-kpi": "var(--hero-kpi)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
