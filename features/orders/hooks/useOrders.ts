"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import type { Id } from "@/convex/_generated/dataModel";

export function useOrders(args: {
  status?: "pending" | "paid" | "failed" | "refunded";
  productId?: Id<"products">;
  search?: string;
  cursor?: string | null;
  limit?: number;
}) {
  const result = useQuery(api.orders.listBySeller, {
    ...args,
    cursor: args.cursor ?? undefined,
  });
  const cached = useCachedQueryResult("orders", result);

  return {
    orders: cached?.orders ?? [],
    continueCursor: cached?.continueCursor ?? null,
    isDone: cached?.isDone ?? true,
    isLoading: result === undefined && cached === undefined,
  };
}

export function useProductsForSelect() {
  return useQuery(api.products.listForSelect);
}
