"use client";

import { createContext, useContext, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

type UserProfile = {
  _id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  profileImageUrl?: string | null;
  theme?: string;
  accentColor?: string;
  palette?: Record<string, string>;
  layout?: Record<string, string>;
  storeName?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  accountType: string;
  subscriptionStatus?: string;
  trialEndsAt?: number;
};

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: convexAuthed, isLoading: convexLoading } = useConvexAuth();
  const router = useRouter();
  const profile = useQuery(
    api.users.getProfile,
    convexLoading || !convexAuthed ? "skip" : undefined
  );

  useEffect(() => {
    if (!convexLoading && !convexAuthed) {
      router.replace("/login");
    }
  }, [convexLoading, convexAuthed, router]);

  const isReady = !convexLoading && convexAuthed;

  const value = useMemo((): UserContextValue => {
    if (!isReady) {
      return { user: null, isLoading: true, isAuthenticated: false };
    }
    return {
      user: profile ?? null,
      isLoading: convexLoading || (convexAuthed && profile === undefined),
      isAuthenticated: profile !== null && profile !== undefined,
    };
  }, [convexLoading, convexAuthed, isReady, profile]);

  if (!isReady) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8">
        <div className="animate-spin-slow flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="text-pink h-[clamp(2.4rem,7.2vw,6rem)] w-[clamp(2.4rem,7.2vw,6rem)]"
          >
            <g stroke="currentColor" strokeWidth={8} strokeLinecap="round" fill="none">
              <line x1={50} y1={6} x2={50} y2={94} />
              <line x1={50} y1={6} x2={50} y2={94} transform="rotate(60 50 50)" />
              <line x1={50} y1={6} x2={50} y2={94} transform="rotate(120 50 50)" />
            </g>
          </svg>
        </div>
        <span className="text-foreground text-6xl font-extrabold select-none">LOADING...</span>
      </div>
    );
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
