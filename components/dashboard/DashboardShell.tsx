"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  List,
  LogOut,
  PencilRuler,
  Settings,
  Sparkles,
  FileText,
} from "lucide-react";
import { clearAuth } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/create", label: "Create", icon: PencilRuler },
  { href: "/dashboard/drafts", label: "Drafts", icon: FileText },
  { href: "/dashboard/lists", label: "Lists", icon: List },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      clearAuth();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <div className="min-h-screen  min-w-full">
      <div className="app-shell  w-full">
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] w-full">
          <aside className="sticky top-0 h-screen border-r border-border/70 hidden overflow-y-auto lg:block">
            <div className="border-b border-border/70 px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Welcome
              </p>
              <div className="mt-2 flex items-center justify-between">
                <h1 className="font-accent text-xl font-semibold">Dashboard</h1>
              </div>
            </div>

            <nav className="space-y-1.5 p-3">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border/70 p-3">
              <Button
                onClick={() => setLogoutOpen(true)}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </aside>

          <section className="min-w-0">
            <header className="app-panel mb-4 flex items-center justify-between px-4 py-3 sm:px-5 lg:hidden">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Linkkit
                </p>
                <p className="font-accent text-lg font-semibold">Dashboard</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-9 rounded-lg px-3"
                >
                  <Link href="/dashboard/create">
                    <Sparkles className="h-4 w-4" />
                    Create
                  </Link>
                </Button>
                <Button
                  onClick={() => setLogoutOpen(true)}
                  size="icon-sm"
                  variant="outline"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <main className="p-2 sm:p-4">{children}</main>
          </section>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to manage your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
