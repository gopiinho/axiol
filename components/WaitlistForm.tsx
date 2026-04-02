"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const PARTICLES = [
  { tx: -34, ty: -28, cls: "bg-pink", delay: 0.04 },
  { tx: 16, ty: -38, cls: "bg-primary", delay: 0 },
  { tx: 40, ty: -6, cls: "bg-pink-muted", delay: 0.09 },
  { tx: -40, ty: 14, cls: "bg-accent", delay: 0.07 },
  { tx: 14, ty: 34, cls: "bg-primary/50", delay: 0.13 },
  { tx: -16, ty: 34, cls: "bg-pink/70", delay: 0.03 },
  { tx: 28, ty: 26, cls: "bg-primary/70", delay: 0.11 },
  { tx: -26, ty: -14, cls: "bg-pink/50", delay: 0.06 },
];

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "loading" | "success" | "already_registered" | "error"
  >("idle");

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    try {
      const result = await joinWaitlist({ email });
      setState(result.status);
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <motion.div
        className="flex items-center gap-4 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Icon with particle burst */}
        <div className="relative shrink-0 h-12 w-12">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className={`absolute top-1/2 left-1/2 h-2 w-2 rounded-full ${p.cls}`}
              initial={{ x: -4, y: -4, scale: 0, opacity: 1 }}
              animate={{
                x: p.tx,
                y: p.ty,
                scale: [0, 1.3, 0.7],
                opacity: [1, 1, 0],
              }}
              transition={{
                delay: p.delay,
                duration: 0.6,
                ease: [0.25, 1, 0.5, 1],
              }}
            />
          ))}
          <motion.div
            className="relative z-10 h-12 w-12 rounded-2xl bg-pink-subtle flex items-center justify-center"
            initial={{ scale: 0.2, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <span className="text-xl select-none">🎉</span>
          </motion.div>
        </div>

        {/* Text */}
        <div className="space-y-0.5">
          <motion.p
            className="text-base sm:text-lg font-bold text-foreground leading-snug"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          >
            You&apos;re on the list!
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          >
            We&apos;ll let you know the moment we launch. 🚀
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (state === "already_registered") {
    return (
      <motion.div
        className="flex items-center gap-3 pt-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <span className="text-sm select-none">👀</span>
        </div>
        <p className="text-sm sm:text-base font-medium text-muted-foreground">
          Already on the list — we&apos;ve got you.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="h-14 rounded-xl border-2 border-border bg-background px-5 text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60 min-w-0 w-full sm:w-72"
        />
        <Button
          type="submit"
          disabled={state === "loading"}
          className="h-14 px-8 text-base sm:text-lg"
        >
          {state === "loading" ? "Joining..." : "Join waitlist"}
        </Button>
      </form>
      {state === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
