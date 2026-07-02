"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function TrackProductClick({
  productId,
  sellerId,
}: {
  productId: Id<"products">;
  sellerId: Id<"users">;
}) {
  const incrementClick = useMutation(api.productClicks.incrementClick);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    incrementClick({ productId, sellerId });
  }, [productId, sellerId, incrementClick]);

  return null;
}
