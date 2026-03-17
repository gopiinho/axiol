"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import heartPixel from "@/public/icons/heart.png";

interface CollectionsCardProps {
  collection: {
    _id: string;
    title: string;
    description?: string | null;
  };
  index: number;
}

export default function CollectionsCard({
  collection,
  index,
}: CollectionsCardProps) {
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
    <Link
      href={`/list/${collection._id}`}
      className="group relative block"
    >
      <div className="relative w-full bg-white rounded-2xl p-6 border-2 border-pink-muted/50 transition-all duration-300 hover:shadow-[0_12px_36px_-12px_oklch(0.72_0.18_350/0.25)] group-hover:border-pink-muted">
        <div className="absolute top-3 right-3">
          <div className="w-9 h-9 bg-pink-subtle rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Image
              src={heartPixel.src}
              className="hover:scale-105 duration-150"
              alt="heart pixel"
              width={12}
              height={12}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 min-h-35">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-pink transition-colors duration-200">
              {collection.title}
            </h2>

            {collection.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-pink-subtle">
            <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">
              see collection
            </span>

            <div className="flex items-center gap-1 text-pink group-hover:gap-2 transition-all duration-200">
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
    </Link>
    </motion.div>
  );
}
