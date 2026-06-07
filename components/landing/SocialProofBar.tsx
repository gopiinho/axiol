"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { ScrollFadeIn } from "@/components/motion/ScrollFadeIn";

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 500, suffix: "+", label: "Creators" },
  { value: 1, suffix: "M+", label: "DMs Sent" },
  { value: 50, suffix: "K+", label: "Products Shared" },
];

export function SocialProofBar() {
  return (
    <section className="border-border/30 relative border-t px-6 py-10 sm:px-16 sm:py-14">
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 lg:gap-24">
        {stats.map((stat, i) => (
          <ScrollFadeIn key={stat.label} delay={i * 0.1}>
            <div className="text-center">
              <p className="text-primary text-3xl font-extrabold tracking-tight sm:text-4xl">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </section>
  );
}
