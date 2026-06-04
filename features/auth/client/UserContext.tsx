"use client";

import { createContext, useContext, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

type UserProfile = {
  _id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  theme?: string;
  accentColor?: string;
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
  const { isAuthenticated: convexAuthed, isLoading: convexLoading } =
    useConvexAuth();
  const router = useRouter();
  const profile = useQuery(
    api.users.getProfile,
    convexLoading || !convexAuthed ? "skip" : undefined,
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linear-to-b from-white to-gray-50">
        <div className="relative h-16 w-16 animate-logo-flip">
          <Image
            src="/axiol-logo.svg"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
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
