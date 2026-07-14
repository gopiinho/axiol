"use client";

import { User } from "lucide-react";
import { useUser } from "@/features/auth/client/UserContext";

export function UserProfile() {
  const { user } = useUser();

  return (
    <div className="bg-foreground border-border/10 flex items-center gap-3 border-b p-2 overflow-hidden">
      <div className="from-primary/20 to-primary/5 border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border bg-linear-to-br">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user?.username || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="text-primary h-5 w-5" />
        )}
      </div>
      <div className="flex min-w-0 flex-col items-start">
        <span className="text-background truncate text-sm font-bold tracking-tight">
          {user?.username || "User"}
        </span>
        <span className="text-muted/80 truncate text-[10px] font-medium tracking-wider">
          {user?.email}
        </span>
      </div>
    </div>
  );
}
