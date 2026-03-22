export type ThemeKey = "default" | "soft" | "bold" | "minimal" | "neon";

export type ThemeDefinition = {
  key: ThemeKey;
  label: string;
  description: string;
  vars: Record<string, string>;
};

export const themes: Record<ThemeKey, ThemeDefinition> = {
  default: {
    key: "default",
    label: "Default",
    description: "Pink & blue with dot-grid background",
    vars: {
      "--store-bg": "oklch(0.98 0.01 340)",
      "--store-surface": "oklch(1 0 0 / 0.6)",
      "--store-border": "oklch(0.85 0.06 340 / 0.6)",
      "--store-accent": "oklch(0.65 0.2 340)",
      "--store-text": "oklch(0.25 0.02 254)",
      "--store-text-muted": "oklch(0.55 0.02 254)",
      "--store-card-bg": "oklch(1 0 0 / 0.6)",
      "--store-radius": "1.5rem",
      "--store-show-dots": "1",
    },
  },
  soft: {
    key: "soft",
    label: "Soft",
    description: "Warm off-white with muted earth tones",
    vars: {
      "--store-bg": "oklch(0.97 0.01 80)",
      "--store-surface": "oklch(1 0 0 / 0.7)",
      "--store-border": "oklch(0.88 0.03 80 / 0.5)",
      "--store-accent": "oklch(0.6 0.12 55)",
      "--store-text": "oklch(0.3 0.03 60)",
      "--store-text-muted": "oklch(0.55 0.03 60)",
      "--store-card-bg": "oklch(1 0 0 / 0.5)",
      "--store-radius": "1.25rem",
      "--store-show-dots": "0",
    },
  },
  bold: {
    key: "bold",
    label: "Bold",
    description: "Strong primary color with white cards",
    vars: {
      "--store-bg": "oklch(0.52 0.2 254)",
      "--store-surface": "oklch(1 0 0 / 0.95)",
      "--store-border": "oklch(0.7 0.1 254 / 0.3)",
      "--store-accent": "oklch(0.52 0.2 254)",
      "--store-text": "oklch(0.2 0.02 254)",
      "--store-text-muted": "oklch(0.45 0.02 254)",
      "--store-card-bg": "oklch(1 0 0 / 0.95)",
      "--store-radius": "1rem",
      "--store-show-dots": "0",
    },
  },
  minimal: {
    key: "minimal",
    label: "Minimal",
    description: "Pure white with thin gray borders",
    vars: {
      "--store-bg": "oklch(1 0 0)",
      "--store-surface": "oklch(1 0 0)",
      "--store-border": "oklch(0.85 0 0)",
      "--store-accent": "oklch(0.3 0 0)",
      "--store-text": "oklch(0.15 0 0)",
      "--store-text-muted": "oklch(0.5 0 0)",
      "--store-card-bg": "oklch(0.98 0 0)",
      "--store-radius": "0.75rem",
      "--store-show-dots": "0",
    },
  },
  neon: {
    key: "neon",
    label: "Neon",
    description: "Dark slate with bright accent glow",
    vars: {
      "--store-bg": "oklch(0.22 0.02 260)",
      "--store-surface": "oklch(0.28 0.02 260)",
      "--store-border": "oklch(0.5 0.2 170 / 0.4)",
      "--store-accent": "oklch(0.75 0.2 170)",
      "--store-text": "oklch(0.95 0 0)",
      "--store-text-muted": "oklch(0.7 0.02 260)",
      "--store-card-bg": "oklch(0.26 0.02 260)",
      "--store-radius": "1rem",
      "--store-show-dots": "0",
    },
  },
};

export const themeKeys = Object.keys(themes) as ThemeKey[];

export function getTheme(key?: string | null): ThemeDefinition {
  if (key && key in themes) return themes[key as ThemeKey];
  return themes.default;
}

export function buildThemeStyle(
  themeKey?: string | null,
  accentColor?: string | null,
): React.CSSProperties {
  const theme = getTheme(themeKey);
  const vars = { ...theme.vars };
  if (accentColor) {
    vars["--store-accent"] = accentColor;
  }
  return vars as unknown as React.CSSProperties;
}
