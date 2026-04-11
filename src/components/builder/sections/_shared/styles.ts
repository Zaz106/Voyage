import { BorderRadius, GlobalStyles } from "../../context/BuilderContext";
import { contrastText } from "../../sidebar/widgets/colorUtils";

/* ── Border-radius presets ── */
export const RADIUS = {
  sharp: "0px",
  soft: "8px",
  rounded: "999px",
} as const satisfies Record<BorderRadius, string>;

/* Softer radius for cards / containers (not pill-shaped) */
export const RADIUS_CARD = {
  sharp: "0px",
  soft: "8px",
  rounded: "16px",
} as const satisfies Record<BorderRadius, string>;

/* ── Theme-aware background colors ── */
export const themeBg = (theme: GlobalStyles["theme"]) =>
  theme === "dark" ? "#0a0a0a" : "#fff";

export const themeCardBg = (theme: GlobalStyles["theme"]) =>
  theme === "dark" ? "#151515" : "#f7f7f7";

export const themeBorder = (theme: GlobalStyles["theme"]) =>
  theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

export const themeMutedText = (theme: GlobalStyles["theme"]) =>
  theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

export const themeSubtleText = (theme: GlobalStyles["theme"]) =>
  theme === "dark" ? "rgba(255,255,255,0.35)" : "#666";

/* ── Button helpers ── */
export function buttonStyles(
  gs: Pick<GlobalStyles, "colors" | "buttonStyle" | "borderRadius">,
) {
  const { colors, buttonStyle, borderRadius } = gs;
  return {
    background: buttonStyle === "filled" ? colors.accent : "transparent",
    color: buttonStyle === "filled" ? contrastText(colors.accent) : colors.accent,
    border: buttonStyle === "outlined" ? `1.5px solid ${colors.accent}` : "none",
    borderRadius: RADIUS[borderRadius],
  } as const;
}

export function ghostButtonStyles(theme: GlobalStyles["theme"], borderRadius: BorderRadius) {
  return {
    background: "transparent",
    color: theme === "dark" ? "rgba(255,255,255,0.6)" : "#555",
    border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
    borderRadius: RADIUS[borderRadius],
  } as const;
}

/* Re-export contrastText so sections only need one import */
export { contrastText } from "../../sidebar/widgets/colorUtils";
