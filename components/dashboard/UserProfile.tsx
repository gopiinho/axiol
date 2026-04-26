"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, HelpCircle, LogOut, User, ChevronRight } from "lucide-react";
import * as motion from "motion/react-client";
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
    <div className="border-b border-border/10">
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center cursor-pointer justify-between p-2 transition-all duration-300 group outline-none relative border border-transparent",
              open
                ? "bg-foreground border-b-transparent z-51"
                : "bg-foreground",
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user?.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <motion.div layout className="flex flex-col items-start min-w-0">
                <span className="text-sm font-bold text-background truncate tracking-tight">
                  {user?.username || "User"}
                </span>
                <span className="text-[10px] text-muted/80 truncate font-medium tracking-wider">
                  {user?.email}
                </span>
              </motion.div>
            </div>
            <Settings
              className={cn(
                "h-4 w-4 text-muted-foreground transition-all duration-500 ease-in-out",
                open ? "rotate-180 text-primary" : "group-hover:rotate-90",
              )}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={0}
          className="w-65 p-0 bg-sidebar text-foreground shadow-xl rounded-none overflow-hidden border border-border"
        >
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <DropdownMenuItem
              asChild
              className="focus:bg-transparent p-0 rounded-none"
            >
              <Link
                href="/dashboard/help"
                className="flex items-center justify-between px-3 text-foreground py-2 text-sm font-bold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-foreground" />
                  Help Center
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-logout-dialog"));
              }}
              className="flex items-center justify-between px-3 py-2 text-sm font-bold text-foreground transition-all group cursor-pointer outline-none focus:bg-destructive/5 focus:text-destructive rounded-none"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4 text-foreground" />
                Log Out
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
            </DropdownMenuItem>

            <div className="p-2 border-t border-border">
              <Button
                variant={isTrial ? "secondary" : "default"}
                className={cn(
                  "w-full h-11 text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all duration-200 rounded-none shadow-none",
                  !isTrial &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 border-none",
                  isTrial && "border border-border hover:bg-muted",
                )}
              >
                {isTrial ? "Trial Status: Active" : "Upgrade to Pro"}
              </Button>
            </div>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
