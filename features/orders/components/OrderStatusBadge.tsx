"use client";

import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "text-amber-700",
  paid: "text-emerald-700",
  failed: "text-red-700",
  refunded: "text-slate-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("text-sm font-medium", statusStyles[status] ?? "text-muted-foreground")}>
      {statusLabels[status] ?? status}
    </span>
  );
}
