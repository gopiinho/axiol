"use client";

import { createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  createdAt: number;
};

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const profile = useQuery(api.users.getProfile);

  const value: UserContextValue = {
    user: profile ?? null,
    isLoading: profile === undefined,
    isAuthenticated: profile !== null && profile !== undefined,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
