"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Vertical offset in pixels */
  offset?: number;
  /** Duration in seconds */
  duration?: number;
}

/**
 * Simple fade-in-up wrapper for single elements.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  offset = 16,
  duration = 0.4,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 1, 0.5, 1], // ease-out-quart
      }}
    >
      {children}
    </motion.div>
  );
}
