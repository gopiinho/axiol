"use client";

import { ThumbnailStepPreview } from "./ThumbnailStepPreview";
import type { ProductStepKey } from "../../registry/productTypes";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";

interface ProductStepPreviewProps {
  stepKey: ProductStepKey;
  liveState: ThumbnailLiveState | null;
}

export function ProductStepPreview({
  stepKey,
  liveState,
}: ProductStepPreviewProps) {
  switch (stepKey) {
    case "thumbnail":
      if (!liveState) return null;
      return <ThumbnailStepPreview {...liveState} />;
    default:
      return null;
  }
}
