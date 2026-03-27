"use client";

import { useState } from "react";
import Link from "next/link";
import { StorePreview } from "@/components/StorePreview";
import { themes, themeKeys, type ThemeKey } from "@/lib/themes";
import { ScrollFadeIn } from "@/components/motion/ScrollFadeIn";
import { Button } from "@/components/ui/button";

const mockCollections = [
  {
    _id: "1",
    title: "Summer Skincare Essentials",
    description: "My holy grail products for glowing skin",
  },
  {
    _id: "2",
    title: "Budget Fashion Finds",
    description: "Under ₹500 fits that look expensive",
  },
];

const mockSocialLinks = [
  {
    url: "https://instagram.com/nemeowww_",
    icon: "instagram" as const,
    label: "Instagram",
    display: "@nemeowww_",
  },
];

export function StorefrontShowcase() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("default");

  return (
    <section className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <ScrollFadeIn>
          <div className="text-center space-y-2 mb-10 sm:mb-14">
            <h2 className="heading-playful text-3xl sm:text-4xl lg:text-5xl text-primary">
              Your branded storefront, ready in minutes
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Get a beautiful linkkit.com/yourname page with themed product
              collections. Share it in your bio.
            </p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn offset={24} duration={0.6}>
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-0 -inset-x-16 -inset-y-8 rounded-full blur-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.85 0.12 340 / 0.5), transparent 70%)",
                }}
              />
              <StorePreview
                publicUrl="linkkit.com/nemeowww"
                username="nemeowww"
                displayName="Nemeowww"
                bio="why are you here?"
                socialLinks={mockSocialLinks}
                collections={mockCollections}
                theme={activeTheme}
              />
            </div>
            <div className="grid gap-4 mt-6">
              <div className="flex items-center mt-6 gap-3">
                {themeKeys.map((key) => {
                  const t = themes[key];
                  const isActive = key === activeTheme;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTheme(key)}
                      className={`h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                        isActive
                          ? "scale-110 border-primary shadow-md"
                          : "border-border/60 hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: t.vars["--store-accent"],
                      }}
                      title={t.label}
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
