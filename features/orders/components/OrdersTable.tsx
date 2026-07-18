"use client";

import { useState, useEffect } from "react";
import { useConvex } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useOrders, useProductsForSelect } from "../hooks/useOrders";
import { OrderRow } from "./OrderRow";
import { OrderMobileCard } from "./OrderMobileCard";
import { OrderDetailSheet } from "./OrderDetailSheet";
import OrdersSkeleton from "./OrdersSkeleton";
import NoOrders from "./NoOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

type OrderWithDetails = Doc<"orders"> & {
  productName: string;
  deliveryTokenStatus: string | null;
  deliveryDownloadCount: number;
  deliveryMaxDownloads: number;
  deliveryStatus: string | null;
};

function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
] as const;

const PAGE_SIZE = 50;

export default function OrdersTable() {
  const convex = useConvex();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [productId, setProductId] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { orders, continueCursor, isLoading } = useOrders({
    search: debouncedSearch || undefined,
    status: status !== "all" ? (status as "paid" | "pending" | "failed" | "refunded") : undefined,
    productId: productId !== "all" ? (productId as Id<"products">) : undefined,
    offset,
    limit: PAGE_SIZE,
  });

  const products = useProductsForSelect();

  const selectedOrder = selectedOrderId
    ? (orders.find((o) => o._id === selectedOrderId) as unknown as OrderWithDetails) ?? null
    : null;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const result = await convex.query(api.orders.listBySellerForExport, {
        search: debouncedSearch || undefined,
        status: status !== "all" ? (status as "paid" | "pending" | "failed" | "refunded") : undefined,
        productId: productId !== "all" ? (productId as Id<"products">) : undefined,
      });

      const rows = result.orders as Array<Doc<"orders"> & { productName: string }>;

      if (rows.length === 0) {
        toast.error("No orders to export");
        return;
      }

      const headers = [
        "Order ID",
        "Product",
        "Buyer Name",
        "Buyer Email",
        "Buyer Phone",
        "Amount (INR)",
        "Currency",
        "Status",
        "Payment Method",
        "Payment Provider",
        "Payment Reference",
        "Created At",
        "Paid At",
        "Platform Fee (INR)",
        "TDS (INR)",
        "Vendor Share (INR)",
        "Delivery Status",
      ];

      const csvRows = rows.map((o) =>
        [
          o._id,
          o.productName,
          o.buyerName,
          o.buyerEmail,
          o.buyerPhone ?? "",
          o.amount.toFixed(2),
          o.currency,
          o.status,
          o.paymentMethod ?? "",
          o.paymentProvider ?? "",
          o.paymentReference ?? "",
          new Date(o.createdAt).toISOString(),
          o.paidAt ? new Date(o.paidAt).toISOString() : "",
           o.platformFee ? o.platformFee.toFixed(2) : "",
           o.tds ? o.tds.toFixed(2) : "",
           o.vendorShare ? o.vendorShare.toFixed(2) : "",
          "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );

      const csv = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length} orders exported`);
    } catch {
      toast.error("Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters = search || status !== "all" || productId !== "all";
  const hasMore = continueCursor !== null;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setProductId("all");
    setOffset(0);
  };

  return (
    <>
      {/* Filters bar */}
      <div className="border-border/50 border-b p-5 sm:p-8">
        {/* Mobile: grid layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v); setOffset(0); }}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={productId} onValueChange={(v) => { setProductId(v); setOffset(0); }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {(products ?? []).map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExportCsv}
              disabled={exporting}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground text-center text-sm font-medium underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Desktop: left-aligned filters + right-aligned actions */}
        <div className="hidden items-center justify-between sm:flex">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setOffset(0); }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={productId} onValueChange={(v) => { setProductId(v); setOffset(0); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {(products ?? []).map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground whitespace-nowrap text-sm font-medium underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportCsv}
            disabled={exporting}
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <NoOrders />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 p-5 sm:hidden sm:p-8">
            {orders.map((order) => (
              <OrderMobileCard
                key={order._id}
                order={order as unknown as OrderWithDetails}
                onClick={(o) => setSelectedOrderId(o._id)}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="p-5 sm:p-8">
            <div className="bg-card hidden overflow-hidden rounded-xs sm:block">
              <table className="w-full table-fixed">
                <thead className="bg-muted/50">
                  <tr className="border-border/50 border-b">
                    <th className="text-muted-foreground w-[30%] px-4 py-3 text-left text-sm font-black">
                      Product
                    </th>
                    <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black sm:table-cell">
                      Buyer
                    </th>
                    <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black sm:table-cell">
                      Amount
                    </th>
                    <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black sm:table-cell">
                      Status
                    </th>
                    <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <OrderRow
                      key={order._id}
                      order={order as unknown as OrderWithDetails}
                      onClick={(o) => setSelectedOrderId(o._id)}
                    />
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr className="border-border/50 border-t">
                    <td className="text-muted-foreground px-4 py-3 text-sm font-black">Totals</td>
                    <td className="hidden px-4 py-3 sm:table-cell" />
                    <td className="hidden px-4 py-3 text-sm font-semibold sm:table-cell">
                      {formatPrice(
                        orders.reduce((s, o) => s + o.amount, 0),
                        orders[0]?.currency
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell" />
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-muted-foreground text-sm">
                        {offset + 1}–{offset + orders.length}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order detail sheet */}
      <OrderDetailSheet
        order={selectedOrder}
        open={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
}
