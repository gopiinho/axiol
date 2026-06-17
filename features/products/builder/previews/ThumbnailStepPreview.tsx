"use client";

import { THUMBNAIL_CARDS } from "@/features/products/components/cards";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";
import {
  buildThemeStyle,
  migrateOldTheme,
  type PaletteConfig,
  type LayoutConfig,
} from "@/lib/themes";
import { resolvePalette } from "@/lib/colorUtils";
import { useUser } from "@/features/auth/client/UserContext";

const DEFAULT_PALETTE: PaletteConfig = resolvePalette({
  bg: "oklch(0.97 0.015 340)",
  accent: "oklch(0.65 0.2 340)",
});

const DEFAULT_LAYOUT: LayoutConfig = {
  preset: "playful",
  borderRadius: "pill",
  cardStyle: "layered",
  spacing: "loose",
  headerLayout: "centered",
  typeScale: "large",
  backgroundPattern: "dots",
};

type ThumbnailStepPreviewProps = ThumbnailLiveState;

export function ThumbnailStepPreview({
  style,
  title,
  subtitle,
  buttonText,
  imageUrl,
  price,
}: ThumbnailStepPreviewProps) {
  const { user } = useUser();

  const palette: PaletteConfig = (() => {
    const stored = user?.palette as PaletteConfig | undefined;
    if (stored?.bg && stored?.accent) return resolvePalette(stored);
    if (user?.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated) return migrated.palette;
    }
    return DEFAULT_PALETTE;
  })();

  const layout: LayoutConfig = (() => {
    const stored = user?.layout as LayoutConfig | undefined;
    if (stored) return stored;
    if (user?.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated) return migrated.layout;
    }
    return DEFAULT_LAYOUT;
  })();

  const theme = { ...buildThemeStyle(palette, layout) };
  delete (theme as Record<string, unknown>).backgroundImage;
  delete (theme as Record<string, unknown>).backgroundSize;

  const Card = THUMBNAIL_CARDS[style];

  const product = {
    _id: "preview",
    name: title,
    productUrl: "#",
    price: price ?? null,
    thumbnailImageUrl: imageUrl ?? null,
    coverImageUrl: null,
    config: {
      thumbnail: {
        style,
        title,
        subtitle,
        buttonText,
      },
    },
  };

  return (
    <div className="space-y-3">
      <div style={theme}>
        <Card product={product} interactive={false} />
      </div>
    </div>
  );
}
