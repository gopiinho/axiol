"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  LogOut,
  Box,
  Settings,
  Store,
  Zap,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/features/auth/client/UserContext";
import BottomNav from "@/components/BottomNav";
import { UserProfile } from "./UserProfile";
import {
  AlertDialog,
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
  { href: "/dashboard/products", label: "Products", icon: Box },
  { href: "/dashboard/automations", label: "Automations", icon: Zap },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isTrial = user?.subscriptionStatus === "trial";

  useEffect(() => {
    const handleOpenLogout = () => setLogoutOpen(true);
    window.addEventListener("open-logout-dialog", handleOpenLogout);
    return () => window.removeEventListener("open-logout-dialog", handleOpenLogout);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.signOut();
    } catch {
      toast.error("Failed to log out", { description: "Please try again." });
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen min-w-full">
      <div className="w-full">
        <div className="grid w-full lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="bg-sidebar border-border/70 sticky top-0 hidden h-screen overflow-y-auto border-r lg:flex lg:flex-col">
            <UserProfile />

            <nav className="flex-1 border-0">
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
                      "flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                      active
                        ? "border-primary bg-foreground text-primary border-l-5"
                        : "text-foreground hover:bg-card border-transparent"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active && "stroke-[2.5]")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-border/10 mt-auto border-t">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-logout-dialog"));
                }}
                className="text-foreground hover:bg-card flex w-full cursor-pointer items-center gap-3 border-l-5 border-transparent px-3.5 py-2.5 text-sm font-semibold transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </aside>

          <section className="h-screen min-w-0 overflow-y-auto">
            <main className="pb-14 md:pb-0">{children}</main>
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
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <Button variant="default" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log out"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
