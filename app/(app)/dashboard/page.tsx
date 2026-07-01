"use client";

import Link from "next/link";
import { PlusCircle, Store, Package, Zap, Info } from "lucide-react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";

import { useProducts } from "@/features/products/hooks/useProduct";
import { useReelMappings } from "@/features/automations/hooks/useAutomations";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/products/new",
    icon: PlusCircle,
    title: "Create Product",
    description: "Create a new product to share with your audience.",
    accent: "bg-primary/10 text-primary",
  },
  {
    href: "/dashboard/store",
    icon: Store,
    title: "My Store",
    description: "Manage your public profile and published posts",
    accent: "bg-pink-subtle text-pink",
  },
  {
    href: "/dashboard/automations",
    icon: Zap,
    title: "Automations",
    description: "Manage reel-to-product auto-DM mappings",
    accent: "bg-status-warn-subtle text-status-warn-subtle-fg",
  },
];

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function EarningsCard({
  label,
  value,
  tooltip,
  loading,
}: {
  label: string;
  value: number;
  tooltip: string;
  loading: boolean;
}) {
  return (
    <div className="border-border/70 bg-card hover:border-border rounded-xs border p-7 transition-colors">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {loading ? (
        <div className="bg-muted mt-1 h-8 w-24 animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold tabular-nums">{formatINR(value)}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { products, isLoading: productsLoading } = useProducts();
  const { mappings, isLoading: mappingsLoading } = useReelMappings();
  const rawEarnings = useQuery(api.orders.getEarningsSummary);
  const earnings = useCachedQueryResult("home:earnings", rawEarnings);

  const isLoading = productsLoading || mappingsLoading;
  const stats = [
    {
      icon: Package,
      label: "Products",
      value: products?.length ?? 0,
      href: "/dashboard/products",
      accent: "from-primary/20 to-primary/5",
    },
    {
      icon: Zap,
      label: "Automations",
      value: mappings?.length ?? 0,
      href: "/dashboard/automations",
      accent: "from-amber/20 to-amber/5",
    },
  ];

  return (
    <div>
      <section className="border-b p-5 sm:p-8">
        <div className="flex min-h-11 items-center">
          <h1 className="app-title">Dashboard</h1>
        </div>
      </section>

      <div className="space-y-8 p-5 sm:p-8">
        <h2 className="mb-3 text-lg font-medium">Activity</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.href}>
                <Link
                  href={action.href}
                  className="border-border/70 bg-card hover:border-border flex flex-col gap-4 rounded-xs border p-5 transition-all duration-200"
                >
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${action.accent} transition-transform duration-200`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{action.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary px-0 hover:bg-transparent"
                      tabIndex={-1}
                    >
                      Go &rarr;
                    </Button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <section>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <EarningsCard
              label="Balance"
              value={earnings?.balance ?? 0}
              tooltip="Your current balance available for payout. Excludes previous payouts."
              loading={earnings === undefined}
            />
            <EarningsCard
              label="Last 7 Days"
              value={earnings?.last7Days ?? 0}
              tooltip="Total earnings from the last 7 days."
              loading={earnings === undefined}
            />
            <EarningsCard
              label="Last 28 Days"
              value={earnings?.last28Days ?? 0}
              tooltip="Total earnings from the last 28 days."
              loading={earnings === undefined}
            />
            <EarningsCard
              label="Total Earnings"
              value={earnings?.totalEarnings ?? 0}
              tooltip="Lifetime earnings from all sales."
              loading={earnings === undefined}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
