"use client";

import { ThumbnailStepPreview } from "./ThumbnailStepPreview";
import { CheckoutStepPreview } from "./CheckoutStepPreview";
import type { ProductStepKey } from "../../registry/productTypes";
import type {
  ThumbnailLiveState,
  CheckoutLiveState,
} from "@/features/products/components/cards/types";

interface ProductStepPreviewProps {
  stepKey: ProductStepKey;
  liveState: ThumbnailLiveState | CheckoutLiveState | null;
}

export function ProductStepPreview({ stepKey, liveState }: ProductStepPreviewProps) {
  switch (stepKey) {
    case "thumbnail":
      if (!liveState) return null;
      return <ThumbnailStepPreview {...(liveState as ThumbnailLiveState)} />;
    case "checkout":
      if (!liveState) return null;
      return <CheckoutStepPreview {...(liveState as CheckoutLiveState)} />;
    default:
      return null;
  }
}
