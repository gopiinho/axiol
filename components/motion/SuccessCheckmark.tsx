"use client";

import { motion } from "motion/react";

interface SuccessCheckmarkProps {
  size?: number;
  className?: string;
}

/**
 * Animated checkmark that draws itself on mount.
 * Used for success celebrations (publish, save, connect).
 */
export function SuccessCheckmark({ size = 56, className }: SuccessCheckmarkProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.07;

  return (
    <motion.div
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.53 0.17 155)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        {/* Checkmark */}
        <motion.path
          d={`M${size * 0.3} ${size * 0.5} L${size * 0.45} ${size * 0.63} L${size * 0.72} ${size * 0.38}`}
          fill="none"
          stroke="oklch(0.53 0.17 155)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}
