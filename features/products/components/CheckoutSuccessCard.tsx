"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, Download, Store } from "lucide-react";

interface CheckoutSuccessCardProps {
  productName: string;
  downloadUrl: string | null;
  buyerEmail: string;
  username: string;
  onClose?: () => void;
}

export function CheckoutSuccessCard({
  productName,
  downloadUrl,
  buyerEmail,
  username,
}: CheckoutSuccessCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--store-bg, #f8fafc)",
          opacity: 0.92,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          backgroundColor: "var(--store-card-bg, var(--store-surface, #ffffff))",
          border: "1px solid var(--store-border, rgba(0,0,0,0.06))",
          borderRadius: "var(--store-radius, 1rem)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02), 0 12px 32px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: `color-mix(in srgb, var(--store-accent, #22c55e) 12%, transparent)`,
            }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: "var(--store-accent, #22c55e)" }} />
          </motion.div>

          <h2
            className="mb-1.5 text-xl font-bold tracking-tight"
            style={{ color: "var(--store-text, #0f172a)" }}
          >
            Payment Successful
          </h2>

          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: "var(--store-text-muted, #64748b)" }}
          >
            Thank you for purchasing{" "}
            <span style={{ color: "var(--store-text, #0f172a)", fontWeight: 600 }}>
              {productName}
            </span>
          </p>

          {downloadUrl && (
            <a
              href={downloadUrl}
              className="group relative mb-4 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:to-transparent before:opacity-0 before:transition-opacity before:duration-150 hover:before:opacity-100 active:brightness-90"
              style={{
                backgroundColor: "var(--store-accent, #22c55e)",
                borderRadius: "var(--store-radius, 0.5rem)",
              }}
            >
              <Download className="relative z-10 h-4.5 w-4.5" />
              <span className="relative z-10">Download</span>
            </a>
          )}

          <p
            className="mb-1 text-xs leading-relaxed"
            style={{ color: "var(--store-text-muted, #94a3b8)" }}
          >
            We&apos;ve also emailed the download link to{" "}
            <span style={{ color: "var(--store-text, #334155)", fontWeight: 500 }}>
              {buyerEmail}
            </span>
          </p>

          <p
            className="text-[11px]"
            style={{ color: "var(--store-text-muted, #94a3b8)", opacity: 0.65 }}
          >
            Link expires in 7 days &middot; Max 5 downloads
          </p>
        </div>

        <div
          className="flex items-center justify-center border-t px-6 py-3.5"
          style={{ borderColor: "var(--store-border, rgba(0,0,0,0.05))" }}
        >
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--store-text-muted, #64748b)" }}
          >
            Back to Store
            <Store className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
