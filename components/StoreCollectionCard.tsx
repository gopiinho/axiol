"use client";

import Link from "next/link";
import { motion } from "motion/react";

interface StoreCollectionCardProps {
  collection: {
    _id: string;
    title: string;
    description?: string | null;
  };
  index: number;
  interactive?: boolean;
}

export function StoreCollectionCard({
  collection,
  index,
  interactive = true,
}: StoreCollectionCardProps) {
  const card = (
    <div
      className="relative w-full rounded-2xl p-6 transition-all duration-300"
      style={{
        backgroundColor: "var(--store-surface, white)",
        border: "2px solid var(--store-border, oklch(0.85 0.06 340 / 0.6))",
        borderRadius: "var(--store-radius, 1.5rem)",
      }}
    >
      <div className="flex flex-col gap-4 min-h-35">
        <div className="flex-1">
          <h2
            className="text-xl font-bold mb-2 leading-tight"
            style={{ color: "var(--store-text, #111)" }}
          >
            {collection.title}
          </h2>

          {collection.description && (
            <p
              className="text-sm line-clamp-2 leading-relaxed"
              style={{ color: "var(--store-text-muted, #6b7280)" }}
            >
              {collection.description}
            </p>
          )}
        </div>

        <div
          className="flex items-center justify-between pt-2"
          style={{
            borderTop:
              "1px solid var(--store-border, oklch(0.85 0.06 340 / 0.6))",
          }}
        >
          <span
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--store-text-muted, #6b7280)" }}
          >
            see collection
          </span>

          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--store-accent, oklch(0.65 0.2 340))" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      {interactive ? (
        <Link href={`/list/${collection._id}`} className="group relative block">
          {card}
        </Link>
      ) : (
        card
      )}
    </motion.div>
  );
}
