"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  offset?: number;
  duration?: number;
}

export function ScrollFadeIn({
  children,
  className,
  delay = 0,
  offset = 16,
  duration = 0.5,
}: ScrollFadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
