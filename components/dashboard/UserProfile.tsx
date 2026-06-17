"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, HelpCircle, LogOut, User, ChevronRight } from "lucide-react";
import { useUser } from "@/features/auth/client/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserProfile() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const isTrial = user?.subscriptionStatus === "trial";

  return (
    <div className="border-border/10 border-b">
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "group relative flex w-full cursor-pointer items-center justify-between border border-transparent p-2 transition-all duration-300 outline-none",
              open ? "bg-foreground z-51 border-b-transparent" : "bg-foreground"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
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
            <Settings
              className={cn(
                "text-muted-foreground h-4 w-4 transition-all duration-500 ease-in-out",
                open ? "text-primary rotate-180" : "group-hover:rotate-90"
              )}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={0}
          className="bg-sidebar text-foreground border-border w-65 overflow-hidden rounded-none border p-0 shadow-xl"
        >
          <div>
            <DropdownMenuItem asChild className="focus:bg-card rounded-none p-0">
              <Link
                href="/dashboard/help"
                className="text-foreground group hover:bg-card flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="text-foreground h-4 w-4" />
                  Help Center
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-logout-dialog"));
              }}
              className="text-foreground group hover:bg-card focus:bg-card flex cursor-pointer items-center justify-between rounded-none px-3 py-2 text-sm font-bold transition-all outline-none"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="text-foreground h-4 w-4" />
                Log Out
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
            </DropdownMenuItem>

            <div className="border-border border-t p-2">
              <Button
                variant={isTrial ? "secondary" : "default"}
                className={cn(
                  "h-11 w-full rounded-none text-[10px] font-semibold shadow-none transition-all duration-200",
                  !isTrial && "bg-primary text-primary-foreground hover:bg-primary/90 border-none",
                  isTrial && "border-border hover:bg-muted border"
                )}
              >
                {isTrial ? "Trial Status: Active" : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
