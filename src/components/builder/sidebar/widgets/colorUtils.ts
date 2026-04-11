export function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function hexToHsv(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").slice(0, 6);
  if (clean.length !== 6) return [0, 0, 1];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

/** Returns relative luminance (0 = black, 1 = white) for a hex colour. */
export function getLuminance(hex: string): number {
  const clean = hex.replace("#", "").slice(0, 6);
  if (clean.length !== 6) return 0;
  const srgb = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map(
    (c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    },
  );
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/** Returns "#fff" or "#000" depending on which has better contrast. */
export function contrastText(bgHex: string): string {
  return getLuminance(bgHex) > 0.35 ? "#000" : "#fff";
}

/** Inverts a hex colour's lightness for theme switching.
 *  Dark colours become light and vice-versa, hue & saturation are preserved. */
export function invertForTheme(hex: string): string {
  const [h, s, v] = hexToHsv(hex);
  // Invert value (lightness), keep a minimum so pure black→near-white
  const newV = Math.max(0.08, Math.min(0.95, 1 - v));
  // Reduce saturation slightly for very light outputs to keep them readable
  const newS = newV > 0.85 ? s * 0.6 : s;
  return hsvToHex(h, newS, newV);
}
