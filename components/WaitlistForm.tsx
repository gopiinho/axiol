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
        <div className="relative h-12 w-12 shrink-0">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className={`absolute top-1/2 left-1/2 h-2 w-2${p.cls}`}
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
            className="bg-pink-subtle relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl"
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
            className="text-foreground text-base leading-snug font-bold sm:text-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          >
            You&apos;re on the list!
          </motion.p>
          <motion.p
            className="text-muted-foreground text-sm"
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
        <div className="bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
          <span className="text-sm select-none">👀</span>
        </div>
        <p className="text-muted-foreground text-sm font-medium sm:text-base">
          Already on the list — we&apos;ve got you.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="border-primary bg-foreground text-background placeholder:text-background focus:ring-primary/40 focus:border-primary h-14 w-full min-w-0 border-2 px-5 text-base focus:ring-2 focus:outline-none disabled:opacity-60 sm:w-72 sm:text-lg"
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
        <p className="text-destructive text-sm">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
