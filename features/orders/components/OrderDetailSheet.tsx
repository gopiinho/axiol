"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderWithDetails = Doc<"orders"> & {
  productName: string;
  deliveryTokenStatus: string | null;
  deliveryDownloadCount: number;
  deliveryMaxDownloads: number;
  deliveryStatus: string | null;
};

function formatDate(ts: number | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
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

function DetailRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground shrink-0 text-xs font-medium">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-semibold",
          mono && "font-mono text-[12px] tracking-tight"
        )}
      >
        {children}
      </span>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
      }}
      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
    >
      <Copy className="h-3 w-3" />
    </button>
  );
}

function formatPaymentMethod(method: string): string {
  return method
    .split("_")
    .map((w) => {
      if (w === "upi") return "UPI";
      if (w === "emi") return "EMI";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/20 border-b pb-2">
      <span className="text-xs font-bold tracking-[0.08em]">{children}</span>
    </div>
  );
}

export function OrderDetailSheet({
  order,
  open,
  onClose,
}: {
  order: OrderWithDetails | null;
  open: boolean;
  onClose: () => void;
}) {
  const [resending, setResending] = useState(false);

  if (!order) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/orders/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Download email resent!");
      } else {
        toast.error("Failed to resend!", { description: data.error });
      }
    } catch {
      toast.error("Network error!", { description: "Could not reach server" });
    } finally {
      setResending(false);
    }
  };

  const hasFees =
    (order.platformFee && order.platformFee > 0) ||
    (order.tds && order.tds > 0) ||
    (order.vendorShare && order.vendorShare > 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="border-border/20 border-b px-6 pt-6 pr-14 pb-4">
          <SheetTitle className="text-lg leading-tight font-bold">{order.productName}</SheetTitle>
          <SheetDescription className="sr-only">Order details</SheetDescription>
          <div className="mt-0.5 flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-muted-foreground/30">·</span>
            <span className="text-muted-foreground font-mono text-[11px]">
              {order._id.slice(0, 12)}...
            </span>
            <CopyButton text={order._id} label="Order ID" />
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-6 py-5 text-[15px] leading-relaxed">
          <section>
            <SectionHeader>Buyer</SectionHeader>
            <div className="space-y-2.5">
              <DetailRow label="Name">{order.buyerName}</DetailRow>
              <DetailRow label="Email">{order.buyerEmail}</DetailRow>
              {order.buyerPhone && <DetailRow label="Phone">{order.buyerPhone}</DetailRow>}
            </div>
          </section>

          <section>
            <SectionHeader>Payment</SectionHeader>
            <div className="space-y-2.5">
              <DetailRow label="Amount">
                <span className="text-base font-bold">
                  {formatPrice(order.amount, order.currency)}
                </span>
              </DetailRow>
              {order.paymentMethod && (
                <DetailRow label="Method">
                  <span className="text-sm font-semibold">
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </DetailRow>
              )}
              {order.paymentReference && (
                <DetailRow label="Reference" mono>
                  <span className="flex items-center gap-1.5">
                    {order.paymentReference.slice(0, 16)}...
                    <CopyButton text={order.paymentReference} label="Reference" />
                  </span>
                </DetailRow>
              )}
            </div>

            {hasFees && (
              <div className="bg-muted/40 space-y-1.5 rounded-lg px-3.5 py-3">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.06em] uppercase">
                  Fee breakdown
                </p>
                {order.platformFee ? (
                  <DetailRow label="Platform fee">{formatPrice(order.platformFee)}</DetailRow>
                ) : null}
                {order.tds ? (
                  <DetailRow label="TDS">{formatPrice(order.tds)}</DetailRow>
                ) : null}
                {order.vendorShare ? (
                  <DetailRow label="You get">
                    <span className="text-emerald-600">{formatPrice(order.vendorShare)}</span>
                  </DetailRow>
                ) : null}
              </div>
            )}
          </section>

          <section>
            <SectionHeader>Dates</SectionHeader>
            <div className="space-y-2.5">
              <DetailRow label="Created">{formatDate(order.createdAt)}</DetailRow>
              <DetailRow label="Paid">{formatDate(order.paidAt)}</DetailRow>
            </div>
          </section>

          <section>
            <SectionHeader>Delivery</SectionHeader>
            <div className="space-y-2.5">
              <DetailRow label="Download">
                {order.deliveryTokenStatus ? (
                  <span className="text-sm font-semibold tabular-nums">
                    {order.deliveryDownloadCount}/{order.deliveryMaxDownloads} times
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
              {order.deliveryStatus && (
                <DetailRow label="Email">
                  <span
                    className={cn(
                      "text-[11px] font-bold tracking-wide uppercase",
                      order.deliveryStatus === "sent" && "text-emerald-600",
                      order.deliveryStatus === "failed" && "text-red-600",
                      order.deliveryStatus === "pending" && "text-amber-600"
                    )}
                  >
                    {order.deliveryStatus}
                  </span>
                </DetailRow>
              )}
            </div>
          </section>
        </div>

        {order.status === "paid" && (
          <div className="border-border/20 flex items-center gap-2 border-t px-6 py-4">
            <Button
              size="lg"
              className="w-full text-sm font-bold"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend download link"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
