import { resolvePalette } from "./colorUtils";

export type PaletteConfig = {
  bg: string;
  accent: string;
  surface?: string;
  border?: string;
  text?: string;
  textMuted?: string;
  cardBg?: string;
};

export type BorderRadiusValue = "sharp" | "subtle" | "round" | "pill";
export type CardStyleValue = "flat" | "shadow" | "layered";
export type SpacingValue = "compact" | "standard" | "loose";
export type HeaderLayoutValue = "centered" | "left" | "card";
export type TypeScaleValue = "small" | "medium" | "large";
export type BackgroundPatternValue = "solid" | "dots" | "gradient";

export type LayoutConfig = {
  preset?: string;
  borderRadius?: string;
  cardStyle?: CardStyleValue;
  spacing?: string;
  headerLayout?: HeaderLayoutValue;
  typeScale?: string;
  backgroundPattern?: BackgroundPatternValue;
};

export const PALETTE_PRESETS: { key: string; label: string; bg: string; accent: string }[] = [
  { key: "blush", label: "Blush", bg: "oklch(0.97 0.015 340)", accent: "oklch(0.65 0.2 340)" },
  {
    key: "warm-earth",
    label: "Warm Earth",
    bg: "oklch(0.95 0.02 75)",
    accent: "oklch(0.58 0.14 50)",
  },
  { key: "dark-oak", label: "Dark Oak", bg: "oklch(0.18 0.02 50)", accent: "oklch(0.7 0.2 25)" },
  { key: "monochrome", label: "Monochrome", bg: "oklch(0.99 0 0)", accent: "oklch(0.15 0 0)" },
  { key: "midnight", label: "Midnight", bg: "oklch(0.16 0.03 280)", accent: "oklch(0.75 0.2 170)" },
  { key: "sky", label: "Sky", bg: "oklch(0.94 0.02 255)", accent: "oklch(0.52 0.2 254)" },
  {
    key: "lavender",
    label: "Lavender",
    bg: "oklch(0.95 0.015 310)",
    accent: "oklch(0.55 0.2 300)",
  },
];

export const LAYOUT_PRESETS: { key: string; label: string; config: LayoutConfig }[] = [
  {
    key: "playful",
    label: "Playful",
    config: {
      borderRadius: "pill",
      cardStyle: "layered",
      spacing: "loose",
      headerLayout: "centered",
      typeScale: "large",
      backgroundPattern: "dots",
    },
  },
  {
    key: "clean",
    label: "Clean",
    config: {
      borderRadius: "subtle",
      cardStyle: "shadow",
      spacing: "standard",
      headerLayout: "left",
      typeScale: "medium",
      backgroundPattern: "solid",
    },
  },
  {
    key: "sharp",
    label: "Sharp",
    config: {
      borderRadius: "sharp",
      cardStyle: "flat",
      spacing: "compact",
      headerLayout: "left",
      typeScale: "small",
      backgroundPattern: "solid",
    },
  },
  {
    key: "card",
    label: "Card",
    config: {
      borderRadius: "round",
      cardStyle: "layered",
      spacing: "standard",
      headerLayout: "card",
      typeScale: "medium",
      backgroundPattern: "gradient",
    },
  },
  {
    key: "dense",
    label: "Dense",
    config: {
      borderRadius: "sharp",
      cardStyle: "flat",
      spacing: "compact",
      headerLayout: "centered",
      typeScale: "small",
      backgroundPattern: "solid",
    },
  },
  {
    key: "bold",
    label: "Bold",
    config: {
      borderRadius: "subtle",
      cardStyle: "layered",
      spacing: "loose",
      headerLayout: "centered",
      typeScale: "large",
      backgroundPattern: "gradient",
    },
  },
];

const RADIUS_MAP: Record<string, string> = {
  sharp: "0.25rem",
  subtle: "0.5rem",
  round: "1rem",
  pill: "1.5rem",
};

const SPACING_MAP: Record<string, { sectionGap: string; cardGap: string; cardPadding: string }> = {
  compact: { sectionGap: "1rem", cardGap: "0.5rem", cardPadding: "0.75rem" },
  standard: { sectionGap: "1.5rem", cardGap: "1rem", cardPadding: "1rem" },
  loose: { sectionGap: "2.5rem", cardGap: "1.5rem", cardPadding: "1.5rem" },
};

const TYPE_SCALE_MAP: Record<string, { heading: string; body: string; price: string }> = {
  small: { heading: "1.25rem", body: "0.8125rem", price: "0.8125rem" },
  medium: { heading: "1.625rem", body: "0.875rem", price: "0.9375rem" },
  large: { heading: "2rem", body: "1rem", price: "1.125rem" },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function resolveRadius(v?: string): string {
  if (!v) return "0.5rem";
  if (RADIUS_MAP[v]) return RADIUS_MAP[v];
  return v;
}

function resolveSpacing(v?: string): { sectionGap: string; cardGap: string; cardPadding: string } {
  if (!v) v = "standard";
  if (SPACING_MAP[v]) return SPACING_MAP[v];
  const t = parseFloat(v);
  if (isNaN(t)) return SPACING_MAP.standard;
  const density = Math.max(0, Math.min(1, t));
  return {
    sectionGap: `${lerp(0.5, 2.5, density).toFixed(2)}rem`,
    cardGap: `${lerp(0.25, 1.5, density).toFixed(2)}rem`,
    cardPadding: `${lerp(0.125, 1.5, density).toFixed(2)}rem`,
  };
}

function resolveTypeScale(v?: string): { heading: string; body: string; price: string } {
  if (!v) v = "medium";
  if (TYPE_SCALE_MAP[v]) return TYPE_SCALE_MAP[v];
  const t = parseFloat(v);
  if (isNaN(t)) return TYPE_SCALE_MAP.medium;
  const scale = Math.max(0, Math.min(1, t));
  return {
    heading: `${lerp(1.125, 1.75, scale).toFixed(3)}rem`,
    body: `${lerp(0.8125, 1, scale).toFixed(3)}rem`,
    price: `${lerp(0.8125, 1.125, scale).toFixed(3)}rem`,
  };
}

function resolveLayout(layout: LayoutConfig): LayoutConfig {
  const preset = LAYOUT_PRESETS.find((p) => p.key === layout.preset);
  const base = preset?.config ?? {};
  return {
    borderRadius: layout.borderRadius ?? base.borderRadius ?? "subtle",
    cardStyle: layout.cardStyle ?? base.cardStyle ?? "shadow",
    spacing: layout.spacing ?? base.spacing ?? "standard",
    headerLayout: layout.headerLayout ?? base.headerLayout ?? "centered",
    typeScale: layout.typeScale ?? base.typeScale ?? "medium",
    backgroundPattern: layout.backgroundPattern ?? base.backgroundPattern ?? "solid",
  };
}

function cardShadowVar(cardStyle: CardStyleValue): string {
  switch (cardStyle) {
    case "shadow":
      return "0 2px 12px oklch(0 0 0 / 0.08)";
    case "layered":
      return "4px 4px 0 var(--store-border)";
    default:
      return "none";
  }
}

function cardBorderVar(cardStyle: CardStyleValue): string {
  switch (cardStyle) {
    case "flat":
      return "2px solid var(--store-border)";
    case "shadow":
      return "1px solid var(--store-border)";
    case "layered":
      return "2px solid var(--store-border)";
    default:
      return "1px solid var(--store-border)";
  }
}

function backgroundStyle(pattern: BackgroundPatternValue, _bg: string): React.CSSProperties {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle, color-mix(in oklch, var(--store-text), transparent 92%) 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      };
    case "gradient":
      return {
        backgroundImage: `linear-gradient(180deg, var(--store-bg) 0%, color-mix(in oklch, var(--store-bg), var(--store-accent) 18%) 100%)`,
      };
    default:
      return {};
  }
}

export function buildThemeStyle(palette: PaletteConfig, layout: LayoutConfig): React.CSSProperties {
  const resolved = resolvePalette(palette);
  const lay = resolveLayout(layout);
  const radius = resolveRadius(lay.borderRadius);
  const spacing = resolveSpacing(lay.spacing);
  const type = resolveTypeScale(lay.typeScale);
  const shadow = cardShadowVar(lay.cardStyle!);
  const border = cardBorderVar(lay.cardStyle!);
  const bgPattern = backgroundStyle(lay.backgroundPattern!, resolved.bg);

  return {
    "--store-bg": resolved.bg,
    "--store-surface": resolved.surface,
    "--store-border": resolved.border,
    "--store-accent": resolved.accent,
    "--store-text": resolved.text,
    "--store-text-muted": resolved.textMuted,
    "--store-card-bg": resolved.cardBg,
    "--store-radius": radius,
    "--store-card-shadow": shadow,
    "--store-card-border": border,
    "--store-section-gap": spacing.sectionGap,
    "--store-card-gap": spacing.cardGap,
    "--store-card-padding": spacing.cardPadding,
    "--store-header-padding": "2rem",
    "--store-header-layout": lay.headerLayout!,
    "--store-heading-size": type.heading,
    "--store-body-size": type.body,
    "--store-price-size": type.price,
    "--store-bg-dots": lay.backgroundPattern === "dots" ? "1" : "0",
    ...bgPattern,
  } as React.CSSProperties;
}

export function sliderToRadius(value: number): string {
  return `${((value / 100) * 1.5).toFixed(2)}rem`;
}

export function radiusToSlider(v?: string): number {
  if (!v) return 8;
  if (RADIUS_MAP[v]) return parseFloat(RADIUS_MAP[v]) * 16;
  const rem = parseFloat(v);
  if (!isNaN(rem)) return Math.round((rem / 1.5) * 100);
  return 8;
}

export function sliderToSpacing(percent: number): string {
  return (percent / 100).toFixed(2);
}

export function spacingToSlider(v?: string): number {
  if (!v) return 50;
  if (v === "compact") return 0;
  if (v === "standard") return 50;
  if (v === "loose") return 100;
  const num = parseFloat(v);
  if (!isNaN(num)) return Math.round(num * 100);
  return 50;
}

export function sliderToTypeScale(percent: number): string {
  return (percent / 100).toFixed(2);
}

export function typeScaleToSlider(v?: string): number {
  if (!v) return 50;
  if (v === "small") return 0;
  if (v === "medium") return 50;
  if (v === "large") return 100;
  const num = parseFloat(v);
  if (!isNaN(num)) return Math.round(num * 100);
  return 50;
}

export const THEME_MIGRATION_MAP: Record<string, { paletteKey: string; layoutKey: string }> = {
  default: { paletteKey: "blush", layoutKey: "playful" },
  soft: { paletteKey: "warm-earth", layoutKey: "clean" },
  bold: { paletteKey: "dark-oak", layoutKey: "bold" },
  minimal: { paletteKey: "monochrome", layoutKey: "sharp" },
  neon: { paletteKey: "midnight", layoutKey: "card" },
};

export function migrateOldTheme(
  oldTheme?: string | null
): { palette: PaletteConfig; layout: LayoutConfig } | null {
  if (!oldTheme) return null;
  const mapping = THEME_MIGRATION_MAP[oldTheme];
  if (!mapping) return null;
  const palettePreset = PALETTE_PRESETS.find((p) => p.key === mapping.paletteKey);
  const layoutPreset = LAYOUT_PRESETS.find((l) => l.key === mapping.layoutKey);
  if (!palettePreset || !layoutPreset) return null;
  return {
    palette: resolvePalette({ bg: palettePreset.bg, accent: palettePreset.accent }),
    layout: { ...layoutPreset.config, preset: layoutPreset.key },
  };
}
