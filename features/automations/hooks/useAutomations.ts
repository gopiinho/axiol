"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
export function useReelMappings() {
  const raw = useQuery(api.instagram.listReelMappings);
  const cached = useCachedQueryResult("reelMappings", raw);
  return {
    mappings: cached ?? [],
    isLoading: raw === undefined && cached === undefined,
  };
}

export function useToggleMapping() {
  return useMutation(api.instagram.toggleReelMapping);
}

export function useDeleteMapping() {
  return useMutation(api.instagram.deleteReelMapping);
}

export function useCreateMapping() {
  return useMutation(api.instagram.createReelMapping);
}

export function useUpdateMapping() {
  return useMutation(api.instagram.updateReelMapping);
}
