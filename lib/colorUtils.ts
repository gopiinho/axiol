import { formatHex, formatCss } from "culori";

export function isLightBg(bg: string): boolean {
  const match = bg.match(/oklch\(([\d.]+)/);
  if (match) return parseFloat(match[1]) > 0.5;
  if (bg.startsWith("#")) {
    const r = parseInt(bg.slice(1, 3), 16) / 255;
    const g = parseInt(bg.slice(3, 5), 16) / 255;
    const b_ = parseInt(bg.slice(5, 7), 16) / 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b_;
    return l > 0.5;
  }
  return true;
}

export function deriveTextColor(bg: string): string {
  if (isLightBg(bg)) return "oklch(0.08 0 0)";
  return "oklch(0.95 0 0)";
}

export function deriveMutedColor(bg: string): string {
  if (isLightBg(bg)) return "oklch(0.4 0 0)";
  return "oklch(0.55 0 0)";
}

export function deriveSurfaceColor(bg: string): string {
  if (isLightBg(bg)) {
    const match = bg.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (match) {
      const l = parseFloat(match[1]);
      const c = parseFloat(match[2]);
      const h = parseFloat(match[3]);
      return `oklch(${Math.min(l + 0.02, 0.99)} ${c * 0.6} ${h})`;
    }
    return "oklch(0.99 0 0)";
  }
  const match = bg.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (match) {
    const l = parseFloat(match[1]);
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);
    return `oklch(${Math.min(l + 0.05, 0.95)} ${c} ${h})`;
  }
  return "oklch(0.22 0.02 0)";
}

export function deriveBorderColor(bg: string): string {
  if (isLightBg(bg)) return "oklch(0.82 0.01 0 / 0.35)";
  return "oklch(0.35 0.01 0 / 0.3)";
}

export function deriveCardBgColor(bg: string): string {
  return deriveSurfaceColor(bg);
}

export function resolvePalette(palette: {
  bg: string;
  accent: string;
  surface?: string;
  border?: string;
  text?: string;
  textMuted?: string;
  cardBg?: string;
}): {
  bg: string;
  accent: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  cardBg: string;
} {
  return {
    bg: palette.bg,
    accent: palette.accent,
    surface: palette.surface ?? deriveSurfaceColor(palette.bg),
    border: palette.border ?? deriveBorderColor(palette.bg),
    text: palette.text ?? deriveTextColor(palette.bg),
    textMuted: palette.textMuted ?? deriveMutedColor(palette.bg),
    cardBg: palette.cardBg ?? deriveCardBgColor(palette.bg),
  };
}

export function oklchToHex(oklch: string): string {
  if (oklch.startsWith("#")) return oklch;
  try {
    const hex = formatHex(oklch);
    if (hex) return hex;
  } catch {}
  return oklch;
}

export function hexToOklch(hex: string): string {
  if (hex.startsWith("oklch(")) return hex;
  try {
    const oklch = formatCss(hex, "oklch");
    if (oklch) return oklch;
  } catch {}
  return hex;
}
