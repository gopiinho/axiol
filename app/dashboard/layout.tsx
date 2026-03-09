"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getAuthToken, clearAuth, isTokenExpired } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = getAuthToken();
  const logoutMutation = useMutation(api.auth.logout);
  const verifySession = useMutation(api.auth.verifySession);
  const [checkingSession, setCheckingSession] = useState(true);

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

    validateSession();
  }, [token, router, verifySession]);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      if (token) {
        await logoutMutation({ token });
      }
      clearAuth();
      router.push("/login");
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <nav className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="md:hidden bg-white border-b sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
