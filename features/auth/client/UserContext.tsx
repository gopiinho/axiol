"use client";

import { createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getSessionToken } from "./session";

type UserProfile = {
  _id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  accountType: string;
  subscriptionStatus?: string;
  trialEndsAt?: number;
  createdAt: number;
};

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const token = getSessionToken();
  const profile = useQuery(api.users.getProfile, token ? { token } : "skip");

  const value: UserContextValue = {
    user: profile ?? null,
    isLoading: profile === undefined && token !== null,
    isAuthenticated: profile !== null && profile !== undefined,
    token,
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
