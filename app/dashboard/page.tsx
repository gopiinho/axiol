"use client";

import Link from "next/link";
import { PlusCircle, Store, BarChart3, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function DashboardPage() {
  const { products, isLoading: productsLoading } = useProducts();
  const { mappings, isLoading: mappingsLoading } = useReelMappings();

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
    <div className="px-5 py-6 lg:px-6 lg:py-8">
      <div className="space-y-1">
        <h1 className="heading-playful text-4xl sm:text-5xl">Welcome back!</h1>
        <p className="text-muted-foreground">What would you like to do today?</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group border-border/70 hover:bg-card/80 bg-card hover:border-border relative overflow-hidden rounded-xs border p-5 transition-all duration-200"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${stat.accent} opacity-60`} />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  {isLoading ? (
                    <div className="bg-muted mt-1 h-9 w-16 animate-pulse rounded" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold tabular-nums">{stat.value}</p>
                  )}
                </div>
                <div className="bg-background/80 rounded-xl p-2.5 backdrop-blur-sm">
                  <Icon className="text-muted-foreground h-5 w-5" strokeWidth={2} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

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
    </div>
  );
}
