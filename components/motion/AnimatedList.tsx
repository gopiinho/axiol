"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child animation in seconds */
  stagger?: number;
  /** Initial offset in pixels */
  offset?: number;
}

/**
 * Wraps children in staggered fade-in-up entrance animations.
 * Each direct child gets a sequential delay.
 */
export function AnimatedList({
  children,
  className,
  stagger = 0.06,
  offset = 12,
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className,
  offset = 12,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: offset },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
