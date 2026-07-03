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
        brand: "#5b4fe8",
        brand2: "#9b51e0",
        coral: "#ff7a5c",
        ok: "#27ae60",
        warn: "#f5a524",
        err: "#eb5757",
        sky: "#2d9cdb",
        "tint-blue": "var(--tint-blue)",
        "tint-mint": "var(--tint-mint)",
        "tint-lavender": "var(--tint-lavender)",
        "tint-peach": "var(--tint-peach)",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        soft: "var(--shadow-soft)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
