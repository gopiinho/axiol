"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, FileText, Settings, List } from "lucide-react";
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
      href: "/dashboard/drafts",
      icon: FileText,
      label: "Drafts",
    },
    {
      href: "/dashboard/create",
      icon: PlusCircle,
      label: "Create",
    },
    {
      href: "/dashboard/lists",
      icon: List,
      label: "Lists",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <nav className="fixed right-0 bottom-2 left-0 z-50 px-3 safe-area-inset-bottom">
      <div className="mx-auto max-w-xl rounded-2xl border border-border/90 bg-card/95 p-1.5 shadow-lg backdrop-blur">
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
                  "flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-1 transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-[1.15rem] w-[1.15rem]", active && "stroke-[2.35]")} />
                <span className={cn("mt-1 text-[11px]", active ? "font-semibold" : "font-medium")}>
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
