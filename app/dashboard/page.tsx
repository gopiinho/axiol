"use client";

import Link from "next/link";
import { PlusCircle, Store, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/create",
    icon: PlusCircle,
    title: "Create Post",
    description: "Set up a new keyword-triggered auto-DM for your reel",
    accent: "bg-primary/10 text-primary",
  },
  {
    href: "/dashboard/store",
    icon: Store,
    title: "My Store",
    description: "Manage your public profile and published posts",
    accent: "bg-pink-subtle text-pink",
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    title: "Analytics",
    description: "Track DMs sent, engagement, and collection performance",
    accent: "bg-accent text-accent-foreground",
  },
];

export default function DashboardPage() {
  return (
    <div className="px-5 lg:px-6 py-6 lg:py-8">
      <FadeIn>
        <div className="space-y-1">
          <h1 className="heading-playful text-4xl text-primary sm:text-5xl">
            linkkit
          </h1>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>
      </FadeIn>

      <AnimatedList className="mt-8 grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <AnimatedListItem key={action.href}>
              <Link
                href={action.href}
                className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-16px_oklch(0.25_0.06_252/0.3)] hover:border-border"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${action.accent} transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{action.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 text-primary hover:bg-transparent hover:text-primary"
                    tabIndex={-1}
                  >
                    Go &rarr;
                  </Button>
                </div>
              </Link>
            </AnimatedListItem>
          );
        })}
      </AnimatedList>
    </div>
  );
}
