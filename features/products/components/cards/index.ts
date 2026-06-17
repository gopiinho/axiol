import { ButtonCard } from "./ButtonCard";
import { CalloutCard } from "./CalloutCard";
import type { ThumbnailStyle } from "./types";
import type { ProductTypeKey } from "../../registry/productTypes";
import { PRODUCT_TYPES } from "../../registry/productTypes";

export const THUMBNAIL_CARDS: Record<
  ThumbnailStyle,
  React.ComponentType<import("./types").ThumbnailCardProps>
> = {
  button: ButtonCard,
  callout: CalloutCard,
};

export function resolveThumbnailStyle(
  product: { type?: string; config?: Record<string, unknown> }
): ThumbnailStyle {
  const configStyle = (
    product.config?.thumbnail as { style?: string } | undefined
  )?.style;
  if (configStyle === "button" || configStyle === "callout") {
    return configStyle as ThumbnailStyle;
  }
  if (product.type) {
    const def = PRODUCT_TYPES[product.type as ProductTypeKey];
    if (def && (def.defaultThumbnailStyle === "button" || def.defaultThumbnailStyle === "callout")) {
      return def.defaultThumbnailStyle as ThumbnailStyle;
    }
  }
  return "button";
}
