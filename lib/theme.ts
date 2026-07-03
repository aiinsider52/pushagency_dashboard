export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "pushdash-theme";

const ORBIT_COLORS = ["#5b4fe8", "#9b51e0", "#2d9cdb", "#27ae60", "#ff7a5c", "#eb5757", "#f5a524", "#14c4b8"];

export function wfColor(i: number) {
  return ORBIT_COLORS[i % ORBIT_COLORS.length];
}

export function getChartTheme(theme: Theme) {
  if (theme === "light") {
    return {
      tooltipStyle: {
        background: "#ffffff",
        border: "1px solid #e9eaf2",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(26,29,46,0.1)",
        color: "#1a1d2e",
        fontSize: 12,
      },
      gridStroke: "#eef0f6",
      tickFill: "#8b90a8",
      pieStroke: "#ffffff",
      cursorFill: "rgba(91,79,232,0.06)",
      success: "#27ae60",
      error: "#eb5757",
      brand: "#5b4fe8",
      brand2: "#9b51e0",
    };
  }
  return {
    tooltipStyle: {
      background: "#1a1d28",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      color: "#f0f1f8",
      fontSize: 12,
    },
    gridStroke: "rgba(255,255,255,0.06)",
    tickFill: "#7a8199",
    pieStroke: "#0f1117",
    cursorFill: "rgba(91,79,232,0.1)",
    success: "#34d399",
    error: "#f87171",
    brand: "#8b7bff",
    brand2: "#b35cff",
  };
}
