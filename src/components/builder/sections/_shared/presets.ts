import type { PaletteColors, BorderRadius, ButtonStyle } from "../../context/BuilderContext";

export type StylePreset = {
  name: string;
  light: PaletteColors;
  dark: PaletteColors;
  fonts: [string, string]; // [heading, body]
  borderRadius: BorderRadius;
  buttonStyle: ButtonStyle;
  showBadge: boolean;
};

/**
 * Ordered list: Minimal, Apple, Elegant, Bold, Clean, Tech.
 * "Warm" removed; "Apple" inserted at position 2.
 */
export const PRESETS: StylePreset[] = [
  {
    name: "Minimal",
    light: { primary: "#111111", secondary: "#aaaaaa", paragraph: "#666666", accent: "#000000" },
    dark:  { primary: "#f1f1f1", secondary: "#777777", paragraph: "#999999", accent: "#ffffff" },
    fonts: ["Inter", "Inter"],
    borderRadius: "sharp",
    buttonStyle: "outlined",
    showBadge: false,
  },
  {
    name: "Apple",
    light: { primary: "#1d1d1f", secondary: "#6e6e73", paragraph: "#515154", accent: "#0071e3" },
    dark:  { primary: "#f5f5f7", secondary: "#86868b", paragraph: "#a1a1a6", accent: "#2997ff" },
    fonts: ["Plus Jakarta Sans", "Plus Jakarta Sans"],
    borderRadius: "soft",
    buttonStyle: "filled",
    showBadge: false,
  },
  {
    name: "Elegant",
    light: { primary: "#3a2e24", secondary: "#c4b5a0", paragraph: "#7a6e62", accent: "#c9a87c" },
    dark:  { primary: "#ede4d8", secondary: "#8a7a68", paragraph: "#a89a8e", accent: "#c9a87c" },
    fonts: ["Playfair Display", "Lora"],
    borderRadius: "soft",
    buttonStyle: "outlined",
    showBadge: true,
  },
  {
    name: "Bold",
    light: { primary: "#1a1a2e", secondary: "#6060a0", paragraph: "#555570", accent: "#6c5ce7" },
    dark:  { primary: "#e8e8ff", secondary: "#8888bb", paragraph: "#9999b0", accent: "#6c5ce7" },
    fonts: ["Space Grotesk", "Inter"],
    borderRadius: "rounded",
    buttonStyle: "filled",
    showBadge: true,
  },
  {
    name: "Clean",
    light: { primary: "#1a1a2e", secondary: "#6666a0", paragraph: "#555580", accent: "#e94560" },
    dark:  { primary: "#eeeeff", secondary: "#8888aa", paragraph: "#9999b0", accent: "#e94560" },
    fonts: ["Raleway", "Open Sans"],
    borderRadius: "soft",
    buttonStyle: "filled",
    showBadge: true,
  },
  {
    name: "Tech",
    light: { primary: "#111111", secondary: "#607d8b", paragraph: "#546e7a", accent: "#00bcd4" },
    dark:  { primary: "#e8f4f8", secondary: "#90a4ae", paragraph: "#78909c", accent: "#00bcd4" },
    fonts: ["Space Grotesk", "Inter"],
    borderRadius: "sharp",
    buttonStyle: "outlined",
    showBadge: false,
  },
];
