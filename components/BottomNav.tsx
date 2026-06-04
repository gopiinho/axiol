"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Box, BarChart3, Settings, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Home",
    },
    {
      href: "/dashboard/store",
      icon: Store,
      label: "My Store",
    },
    {
      href: "/dashboard/products",
      icon: Box,
      label: "Products",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <nav className="fixed right-0 bottom-2 left-0 z-50 px-3 safe-area-inset-bottom">
      <div className="mx-auto max-w-xl rounded-none border border-border/80 bg-card/95 p-1.5 shadow-[0_-4px_24px_-8px_oklch(0.25_0.06_252/0.4)] backdrop-blur-lg">
        <div className="flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center px-1 transition-all duration-200",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-[1.2rem] w-[1.2rem]", active && "stroke-[2.5]")} />
                <span className={cn("mt-1 text-[10.5px]", active ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
