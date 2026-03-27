"use client";

import { ScrollFadeIn } from "@/components/motion/ScrollFadeIn";
import {
  BarChart3,
  Palette,
  Shield,
  Smartphone,
  Timer,
  Hash,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Track DMs, comments, and clicks as they happen",
    bg: "bg-primary/10",
    color: "text-primary",
  },
  {
    icon: Palette,
    title: "5 Beautiful Themes",
    desc: "Customize your storefront to match your vibe",
    bg: "bg-pink-subtle",
    color: "text-pink",
  },
  {
    icon: Shield,
    title: "Smart Rate Limiting",
    desc: "Never worry about Instagram limits again",
    bg: "bg-accent",
    color: "text-accent-foreground",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    desc: "Your store looks perfect on every device",
    bg: "bg-primary/10",
    color: "text-primary",
  },
  {
    icon: Timer,
    title: "Quick Setup",
    desc: "Go from signup to live store in under 5 minutes",
    bg: "bg-pink-subtle",
    color: "text-pink",
  },
  {
    icon: Hash,
    title: "Keyword Matching",
    desc: "Multiple keywords per reel, case-insensitive",
    bg: "bg-accent",
    color: "text-accent-foreground",
  },
];

export function FeatureGrid() {
  return (
    <section className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <ScrollFadeIn>
          <div className="text-center space-y-2 mb-10 sm:mb-14">
            <h2 className="heading-playful text-3xl sm:text-4xl text-primary">
              Everything you need to grow
            </h2>
            <p className="text-sm text-muted-foreground">
              Built for creators who want to monetize smarter
            </p>
          </div>
        </ScrollFadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <ScrollFadeIn key={f.title} delay={i * 0.08} offset={12}>
              <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-5 sm:p-6 space-y-3">
                <div
                  className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${f.bg} ${f.color}`}
                >
                  <f.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
