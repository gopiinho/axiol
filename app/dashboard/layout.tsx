"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import {
  Home,
  List,
  LogOut,
  PencilRuler,
  Settings,
  Sparkles,
  FileText,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { getAuthToken, clearAuth, isTokenExpired } from "@/lib/auth";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/create", label: "Create", icon: PencilRuler },
  { href: "/dashboard/drafts", label: "Drafts", icon: FileText },
  { href: "/dashboard/lists", label: "Lists", icon: List },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getAuthToken();
  const logoutMutation = useMutation(api.auth.logout);
  const verifySession = useMutation(api.auth.verifySession);
  const [checkingSession, setCheckingSession] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!token || isTokenExpired()) {
        clearAuth();
        router.push("/login");
        return;
      }

      try {
        const result = await verifySession({ token });
        if (!result.valid) {
          clearAuth();
          router.push("/login");
          return;
        }
      } catch {
        clearAuth();
        router.push("/login");
        return;
      } finally {
        setCheckingSession(false);
      }
    };

    void validateSession();
  }, [token, router, verifySession]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (token) {
        await logoutMutation({ token });
      }
      clearAuth();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="app-panel px-6 py-5 text-sm text-muted-foreground">
          Verifying your session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="app-shell pt-4 sm:pt-6 lg:pt-8">
        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="app-panel sticky top-6 hidden h-fit overflow-hidden lg:block">
            <div className="border-b border-border/70 px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Nemeowww
              </p>
              <div className="mt-2 flex items-center justify-between">
                <h1 className="font-accent text-xl font-semibold">Dashboard</h1>
                <Badge variant="secondary" className="rounded-lg px-2 py-1 text-[10px]">
                  LIVE
                </Badge>
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
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
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
                  Nemeowww
                </p>
                <p className="font-accent text-lg font-semibold">Dashboard</p>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="ghost" className="h-9 rounded-lg px-3">
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
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
