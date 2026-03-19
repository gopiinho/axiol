"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  List,
  LogOut,
  PencilRuler,
  Settings,
  Store,
  FileText,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserProvider } from "@/features/auth/client/UserContext";
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
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/store", label: "My Store", icon: Store },
  { href: "/dashboard/lists", label: "Collections", icon: List },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/create", label: "Create", icon: PencilRuler },
  { href: "/dashboard/drafts", label: "Drafts", icon: FileText },
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
      await authClient.signOut();
    } catch {
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
      router.replace("/login");
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen min-w-full">
        <div className="app-shell w-full">
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] w-full">
            <aside className="sticky top-0 h-screen border-r border-border/70 hidden lg:flex lg:flex-col overflow-y-auto">
              <div className="border-b border-border/70 px-5 py-5">
                <h1 className="heading-playful text-3xl text-primary">
                  linkkit
                </h1>
              </div>

              <nav className="flex-1 space-y-1 p-3">
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
                        "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                        active
                          ? "border-primary/25 bg-primary/10 text-primary shadow-[0_2px_8px_-4px_oklch(0.5_0.22_254/0.25)]"
                          : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-card hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4", active && "stroke-[2.5]")}
                      />
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
              <main>{children}</main>
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
    </UserProvider>
  );
}
