export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "pushdash-theme";

export function getChartTheme(theme: Theme) {
  if (theme === "light") {
    return {
      tooltipStyle: {
        background: "#ffffff",
        border: "1px solid #e9eaf2",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(26,29,46,0.10)",
        color: "#1a1d2e",
      },
      gridStroke: "#eef0f6",
      tickFill: "#8a90a6",
      pieStroke: "#ffffff",
      cursorFill: "#f5f6fb",
    };
  }
  return {
    tooltipStyle: {
      background: "rgba(18, 20, 32, 0.95)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      color: "#f0f1f8",
      backdropFilter: "blur(12px)",
    },
    gridStroke: "rgba(255,255,255,0.06)",
    tickFill: "#7a8199",
    pieStroke: "rgba(8,9,15,0.8)",
    cursorFill: "rgba(139,123,255,0.08)",
  };
}
