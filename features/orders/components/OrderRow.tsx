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

function formatPrice(cents: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents);
}

export function OrderRow({
  order,
  onClick,
}: {
  order: OrderWithDetails;
  onClick: (order: OrderWithDetails) => void;
}) {
  return (
    <tr
      className="group border-border/50 hover:bg-muted/30 cursor-pointer border-b transition-colors"
      onClick={() => onClick(order)}
    >
      <td className="px-4 py-3.5">
        <p className="max-w-52 truncate text-sm font-semibold">{order.productName}</p>
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{order.buyerName}</p>
          <p className="text-muted-foreground truncate text-[11px]">{order.buyerEmail}</p>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <span className="text-sm font-medium">{formatPrice(order.amountCents, order.currency)}</span>
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <p className="text-muted-foreground whitespace-nowrap text-sm">{relativeTime(order.createdAt)}</p>
        <p className="text-muted-foreground/50 whitespace-nowrap text-[10px]">{exactTime(order.createdAt)}</p>
      </td>
    </tr>
  );
}
