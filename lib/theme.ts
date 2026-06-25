// ── Types ─────────────────────────────────────────────────────────────────────

export type FontFamily = "cairo" | "tajawal" | "noto-naskh" | "ibm-plex";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  background: string;
  text: string;
  fontFamily: FontFamily;
}

// ── Font registry ─────────────────────────────────────────────────────────────

export const FONT_OPTIONS: Record<FontFamily, {
  label: string;
  labelAr: string;
  googleParam: string;  // "family=…" segment for Google Fonts URL
  cssStack: string;     // complete font-family CSS value
}> = {
  cairo: {
    label: "Cairo",
    labelAr: "القاهرة",
    googleParam: "Cairo:wght@300;400;500;600;700;800;900",
    cssStack: "'Cairo', sans-serif",
  },
  tajawal: {
    label: "Tajawal",
    labelAr: "تجوال",
    googleParam: "Tajawal:wght@200;300;400;500;700;800;900",
    cssStack: "'Tajawal', sans-serif",
  },
  "noto-naskh": {
    label: "Noto Naskh Arabic",
    labelAr: "نوتو نسخ عربي",
    googleParam: "Noto+Naskh+Arabic:wght@400;500;600;700",
    cssStack: "'Noto Naskh Arabic', serif",
  },
  "ibm-plex": {
    label: "IBM Plex Arabic",
    labelAr: "IBM بلكس عربي",
    googleParam: "IBM+Plex+Arabic:wght@300;400;500;600;700",
    cssStack: "'IBM Plex Arabic', sans-serif",
  },
};

export function buildGoogleFontsUrl(font: FontFamily = "cairo"): string {
  const param = FONT_OPTIONS[font]?.googleParam ?? FONT_OPTIONS.cairo.googleParam;
  return `https://fonts.googleapis.com/css2?family=${param}&display=swap`;
}

// ── Default theme: Luxury Gold (current brand) ────────────────────────────────

export const DEFAULT_THEME: ThemeColors = {
  primary:    "#C49A3C",
  secondary:  "#8B5E3C",
  accent:     "#D4AE5C",
  success:    "#22C55E",
  background: "#FAF8F5",
  text:       "#1A1A1A",
  fontFamily: "cairo",
};

// ── Preset themes ─────────────────────────────────────────────────────────────

export const THEME_PRESETS: Record<string, { label: string; labelAr: string; colors: ThemeColors }> = {
  luxuryGold: {
    label: "Luxury Gold",
    labelAr: "ذهبي فاخر",
    colors: {
      primary:    "#C49A3C",
      secondary:  "#8B5E3C",
      accent:     "#D4AE5C",
      success:    "#22C55E",
      background: "#FAF8F5",
      text:       "#1A1A1A",
      fontFamily: "cairo",
    },
  },
  coffeeBrown: {
    label: "Coffee Brown",
    labelAr: "بني القهوة",
    colors: {
      primary:    "#6F4E37",
      secondary:  "#3E2723",
      accent:     "#A1887F",
      success:    "#22C55E",
      background: "#FAF7F5",
      text:       "#1A1A1A",
      fontFamily: "cairo",
    },
  },
  royalPurple: {
    label: "Royal Purple",
    labelAr: "بنفسجي ملكي",
    colors: {
      primary:    "#7C3AED",
      secondary:  "#5B21B6",
      accent:     "#A78BFA",
      success:    "#22C55E",
      background: "#F9F8FF",
      text:       "#1A1A1A",
      fontFamily: "tajawal",
    },
  },
  emeraldGreen: {
    label: "Emerald Green",
    labelAr: "أخضر زمردي",
    colors: {
      primary:    "#059669",
      secondary:  "#065F46",
      accent:     "#34D399",
      success:    "#22C55E",
      background: "#F5FAF8",
      text:       "#1A1A1A",
      fontFamily: "cairo",
    },
  },
  oceanBlue: {
    label: "Ocean Blue",
    labelAr: "أزرق المحيط",
    colors: {
      primary:    "#0284C7",
      secondary:  "#0C4A6E",
      accent:     "#38BDF8",
      success:    "#22C55E",
      background: "#F5F9FF",
      text:       "#1A1A1A",
      fontFamily: "ibm-plex",
    },
  },
};

// ── Color manipulation helpers ────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgbArray(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").padEnd(6, "0");
  return [
    parseInt(clean.substring(0, 2), 16) || 0,
    parseInt(clean.substring(2, 4), 16) || 0,
    parseInt(clean.substring(4, 6), 16) || 0,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function darkenHex(hex: string, factor = 0.18): string {
  const [r, g, b] = hexToRgbArray(hex);
  return rgbToHex(clamp(r * (1 - factor)), clamp(g * (1 - factor)), clamp(b * (1 - factor)));
}

export function lightenHex(hex: string, factor = 0.18): string {
  const [r, g, b] = hexToRgbArray(hex);
  return rgbToHex(
    clamp(r + (255 - r) * factor),
    clamp(g + (255 - g) * factor),
    clamp(b + (255 - b) * factor),
  );
}

// Produces space-separated RGB channels: "196 154 60"
// Required by Tailwind's `rgb(var(--x) / <alpha-value>)` color format.
export function hexToRgbChannels(hex: string): string {
  const [r, g, b] = hexToRgbArray(hex);
  return `${r} ${g} ${b}`;
}

// ── CSS variable generator ────────────────────────────────────────────────────

export function generateThemeCss(theme: Partial<ThemeColors>): string {
  const t: ThemeColors = { ...DEFAULT_THEME, ...theme };
  const font = FONT_OPTIONS[t.fontFamily] ?? FONT_OPTIONS.cairo;

  return [
    ":root {",
    `  --theme-primary: ${hexToRgbChannels(t.primary)};`,
    `  --theme-primary-dark: ${hexToRgbChannels(darkenHex(t.primary))};`,
    `  --theme-primary-light: ${hexToRgbChannels(lightenHex(t.primary))};`,
    `  --theme-secondary: ${hexToRgbChannels(t.secondary)};`,
    `  --theme-secondary-dark: ${hexToRgbChannels(darkenHex(t.secondary))};`,
    `  --theme-secondary-light: ${hexToRgbChannels(lightenHex(t.secondary))};`,
    `  --theme-accent: ${hexToRgbChannels(t.accent)};`,
    `  --theme-success: ${hexToRgbChannels(t.success)};`,
    `  --theme-bg: ${hexToRgbChannels(t.background)};`,
    `  --theme-text: ${hexToRgbChannels(t.text)};`,
    `  --theme-font: ${font.cssStack};`,
    "}",
  ].join("\n");
}

// ── Parse themeJson from DB ───────────────────────────────────────────────────

export function parseThemeJson(raw: string | null | undefined): ThemeColors {
  if (!raw) return DEFAULT_THEME;
  try {
    const parsed = JSON.parse(raw) as Partial<ThemeColors>;
    return { ...DEFAULT_THEME, ...parsed };
  } catch {
    return DEFAULT_THEME;
  }
}
