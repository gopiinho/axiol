"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

interface ListViewTrackerProps {
  collectionId: string;
  collectionTitle: string;
}

export default function ListViewTracker({
  collectionId,
  collectionTitle,
}: ListViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) {
      return;
    }

    posthog.capture("collection_viewed", {
      collection_id: collectionId,
      collection_title: collectionTitle,
    });
    hasTracked.current = true;
  }, [collectionId, collectionTitle]);

  return null;
}
