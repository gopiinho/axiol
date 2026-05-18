"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import AutomationsList from "@/features/automations/components/AutomationsList";
import { Plus } from "lucide-react";

export default function AutomationsPage() {
  return (
    <div>
      <FadeIn>
        <section className="p-5 sm:p-8 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="app-title">Automations</h1>
              <p className="app-subtitle mt-1">
                Auto-DM product links to your followers and boost your sales.
              </p>
            </div>
            <Link href="/dashboard/automations/new">
              <Button size="lg" className="gap-2 sm:self-start">
                New Automation
              </Button>
            </Link>
          </div>
        </section>
      </FadeIn>

      <AutomationsList />
    </div>
  );
}
