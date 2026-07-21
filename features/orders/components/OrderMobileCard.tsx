"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderWithDetails = Doc<"orders"> & {
  productName: string;
  deliveryTokenStatus: string | null;
  deliveryDownloadCount: number;
  deliveryMaxDownloads: number;
  deliveryStatus: string | null;
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 2) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function exactTime(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderMobileCard({
  order,
  onClick,
}: {
  order: OrderWithDetails;
  onClick: (order: OrderWithDetails) => void;
}) {
  return (
    <div
      className="app-panel active:bg-muted/30 cursor-pointer p-4"
      onClick={() => onClick(order)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{order.productName}</p>
          <p className="text-muted-foreground truncate text-sm">{order.buyerName}</p>
          <p className="text-muted-foreground truncate text-[11px]">{order.buyerEmail}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-sm font-semibold">{formatPrice(order.amount, order.currency)}</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground text-[11px]">{relativeTime(order.createdAt)}</span>
      </div>
      <p className="text-muted-foreground/50 text-[10px]">{exactTime(order.createdAt)}</p>
    </div>
  );
}
