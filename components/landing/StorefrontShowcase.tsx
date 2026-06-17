"use client";

import { useState } from "react";
import Link from "next/link";
import { PALETTE_PRESETS } from "@/lib/themes";
import { ScrollFadeIn } from "@/components/motion/ScrollFadeIn";
import { Button } from "@/components/ui/button";

export function StorefrontShowcase() {
  const [activePalette, setActivePalette] = useState(0);

  return (
    <section className="bg-sidebar relative px-6 py-16 sm:px-12 sm:py-24 lg:px-20 xl:px-28">
      <div className="mx-auto w-full max-w-7xl">
        <ScrollFadeIn>
          <div className="mb-10 space-y-2 text-center sm:mb-14">
            <h2 className="heading-playful text-primary text-3xl sm:text-4xl lg:text-5xl">
              Your branded storefront, ready in minutes
            </h2>
            <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
              Get a beautifu axiol.com/yourname page with themed product collections. Share it in
              your bio.
            </p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn offset={24} duration={0.6}>
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-0 -inset-x-16 -inset-y-8 rounded-full opacity-30 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.85 0.12 340 / 0.5), transparent 70%)",
                }}
              />
            </div>
            <div className="mt-6 grid gap-4">
              <div className="mt-6 flex items-center gap-3">
                {PALETTE_PRESETS.map((p, i) => {
                  const isActive = i === activePalette;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setActivePalette(i)}
                      aria-label={p.label}
                      className={`h-11 w-11 rounded-full border-2 transition-all duration-200 ${
                        isActive
                          ? "border-primary scale-110 shadow-md"
                          : "border-border/60 hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: p.accent,
                      }}
                    />
                  );
                })}
              </div>

              <Button asChild variant="outline">
                <Link href="/signup">Create your store</Link>
              </Button>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
