"use client";

import { Package } from "lucide-react";

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface TopProductsTableProps {
  products: Array<{
    name: string;
    sales: number;
    revenue: number;
    clicks: number;
  }>;
  loading: boolean;
}

export function TopProductsTable({ products, loading }: TopProductsTableProps) {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="border-border/70 bg-card rounded-xs border">
      <div className="border-border/70 flex items-center gap-2 border-b p-4">
        <h3 className="font-semibold">Top Products</h3>
      </div>

      {loading ? (
        <div className="p-6">
          <div className="bg-muted h-48 w-full animate-pulse rounded" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
          No sales yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
                  Product
                </th>
                <th className="text-muted-foreground px-4 py-3 text-right text-sm font-black">
                  Sales
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-right text-sm font-black sm:table-cell">
                  Clicks
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-right text-sm font-black sm:table-cell">
                  Conv.
                </th>
                <th className="text-muted-foreground px-4 py-3 text-right text-sm font-black">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((product, i) => (
                <tr key={i} className="border-border/50 border-b last:border-0">
                  <td className="max-w-[200px] truncate px-4 py-3.5 text-sm font-semibold">
                    {product.name}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-medium tabular-nums">
                    {product.sales}
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-sm font-medium tabular-nums sm:table-cell">
                    {product.clicks}
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-sm font-medium tabular-nums sm:table-cell">
                    {product.clicks > 0
                      ? `${((product.sales / product.clicks) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-medium tabular-nums">
                    {formatINR(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
