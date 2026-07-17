"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useQueryParam(
  key: string,
  defaultValue: string
): [string, (value: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const pendingRef = useRef<string | null>(null);

  const currentValue = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (value: string) => {
      const current = searchParamsRef.current;
      const params = new URLSearchParams(current.toString());
      if (value === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      const targetUrl = `${pathname}${query ? `?${query}` : ""}`;
      if (pendingRef.current === targetUrl) return;
      pendingRef.current = targetUrl;
      router.replace(targetUrl, { scroll: false });
    },
    [router, pathname, key, defaultValue]
  );

  return [currentValue, setValue];
}
