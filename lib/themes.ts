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
    description: "Playful pink with dot-grid pattern",
    vars: {
      "--store-bg": "oklch(0.97 0.015 340)",
      "--store-surface": "oklch(1 0 0 / 0.6)",
      "--store-border": "oklch(0.85 0.06 340 / 0.6)",
      "--store-accent": "oklch(0.65 0.2 340)",
      "--store-text": "oklch(0.25 0.02 340)",
      "--store-text-muted": "oklch(0.5 0.03 340)",
      "--store-card-bg": "oklch(1 0 0 / 0.6)",
      "--store-radius": "1.5rem",
      "--store-show-dots": "1",
    },
  },
  soft: {
    key: "soft",
    label: "Soft",
    description: "Warm cream with earthy organic tones",
    vars: {
      "--store-bg": "oklch(0.95 0.02 75)",
      "--store-surface": "oklch(0.98 0.01 75 / 0.8)",
      "--store-border": "oklch(0.82 0.04 75 / 0.5)",
      "--store-accent": "oklch(0.58 0.14 50)",
      "--store-text": "oklch(0.28 0.04 55)",
      "--store-text-muted": "oklch(0.5 0.04 60)",
      "--store-card-bg": "oklch(0.98 0.01 75 / 0.7)",
      "--store-radius": "1.25rem",
      "--store-show-dots": "0",
    },
  },
  bold: {
    key: "bold",
    label: "Bold",
    description: "Warm dark with dramatic contrast",
    vars: {
      "--store-bg": "oklch(0.18 0.02 50)",
      "--store-surface": "oklch(0.24 0.02 50)",
      "--store-border": "oklch(0.35 0.03 50 / 0.4)",
      "--store-accent": "oklch(0.7 0.2 25)",
      "--store-text": "oklch(0.95 0.01 80)",
      "--store-text-muted": "oklch(0.68 0.02 70)",
      "--store-card-bg": "oklch(0.24 0.02 50)",
      "--store-radius": "0.5rem",
      "--store-show-dots": "0",
    },
  },
  minimal: {
    key: "minimal",
    label: "Minimal",
    description: "Stark editorial with sharp geometry",
    vars: {
      "--store-bg": "oklch(0.99 0 0)",
      "--store-surface": "oklch(1 0 0)",
      "--store-border": "oklch(0.78 0 0)",
      "--store-accent": "oklch(0.15 0 0)",
      "--store-text": "oklch(0.1 0 0)",
      "--store-text-muted": "oklch(0.42 0 0)",
      "--store-card-bg": "oklch(1 0 0)",
      "--store-radius": "0.25rem",
      "--store-show-dots": "0",
    },
  },
  neon: {
    key: "neon",
    label: "Neon",
    description: "Cool dark with glowing accents",
    vars: {
      "--store-bg": "oklch(0.16 0.03 280)",
      "--store-surface": "oklch(0.22 0.03 280)",
      "--store-border": "oklch(0.5 0.2 170 / 0.35)",
      "--store-accent": "oklch(0.75 0.2 170)",
      "--store-text": "oklch(0.93 0.01 280)",
      "--store-text-muted": "oklch(0.65 0.03 280)",
      "--store-card-bg": "oklch(0.21 0.03 280)",
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
  accentColor?: string | null
): React.CSSProperties {
  const theme = getTheme(themeKey);
  const vars = { ...theme.vars };
  if (accentColor) {
    vars["--store-accent"] = accentColor;
  }
  return vars as unknown as React.CSSProperties;
}
