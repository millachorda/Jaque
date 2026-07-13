export const T = {
  ink: "#14171c",
  panel: "#1c2128",
  line: "#2c333d",
  light: "#ecd9b0",
  dark: "#9c6f47",
  amber: "#e0a23a",
  cream: "#e7e2d6",
  sel: "#d7b25b",
  danger: "#d1495b",
  green: "#7ec27e",
  muted: "#8b94a3"
};
export function btn(bg, color, border) {
  return {
    padding: "11px 14px",
    minHeight: 44,
    borderRadius: 7,
    cursor: "pointer",
    border: `1px solid ${border || bg}`,
    background: bg,
    color,
    fontWeight: 600,
    fontSize: 13
  };
}
