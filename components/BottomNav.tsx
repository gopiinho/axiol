"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Home, Box, BarChart3, Store, Zap, Settings, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/store", label: "My Store", icon: Store },
  { href: "/dashboard/products", label: "Products", icon: Box },
  { href: "/dashboard/automations", label: "Automations", icon: Zap },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/dashboard/settings");

export default function BottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="fixed right-0 bottom-0 left-0 z-50">
        <div className="border-border/80 bg-sidebar mx-auto max-w-xl rounded-none">
          <div className="flex items-center justify-around">
            {BOTTOM_NAV_ITEMS.map((item) => {
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
                      ? "bg-foreground text-primary"
                      : "text-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-[1.2rem] w-[1.2rem]", active && "stroke-[2.5]")} />
                  <span className={cn("mt-1 text-[10.5px]", active ? "font-bold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu"
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center px-1 transition-all duration-200",
                "text-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="mt-1 text-[10.5px] font-medium">Menu</span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-sidebar absolute right-0 bottom-0 left-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="text-lg font-bold">Navigation</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground hover:bg-secondary rounded-full p-1"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-3 pb-6">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-all duration-200",
                        active ? "bg-foreground text-primary" : "text-foreground hover:bg-card"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="border-border/10 mt-4 border-t pt-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("open-logout-dialog"));
                    }}
                    className="text-foreground hover:bg-card flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
