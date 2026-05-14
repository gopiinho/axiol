"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
export function useReelMappings() {
  const raw = useQuery(api.instagram.listReelMappings);
  return {
    mappings: raw ?? [],
    isLoading: raw === undefined,
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
