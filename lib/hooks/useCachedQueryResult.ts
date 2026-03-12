"use client";

import { useEffect } from "react";

const queryResultCache = new Map<string, unknown>();

export function useCachedQueryResult<T>(cacheKey: string, value: T | undefined) {
  useEffect(() => {
    if (value !== undefined) {
      queryResultCache.set(cacheKey, value);
    }
  }, [cacheKey, value]);

  if (value !== undefined) {
    return value;
  }

  return queryResultCache.get(cacheKey) as T | undefined;
}
