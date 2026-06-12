"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseBarProps {
  price: string;
  buttonText: string;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
}

export function PurchaseBar({
  price,
  buttonText,
  loading = false,
  disabled = false,
  onSubmit,
}: PurchaseBarProps) {
  const formattedPrice = /^[₹$€£]/.test(price) ? price : `₹ ${price}`;

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 border-t"
      style={{
        backgroundColor: "var(--store-surface, white)",
        borderColor: "var(--store-border, oklch(0.82 0.01 0 / 0.35))",
      }}
    >
      <div
        className="mx-auto flex w-full items-center gap-4 px-4 py-3 lg:max-w-[50%]"
        style={{ padding: "var(--store-card-padding, 1rem)" }}
      >
        <div className="flex flex-col">
          <span
            style={{
              color: "var(--store-text-muted)",
              fontSize: "var(--store-body-size, 0.8125rem)",
            }}
          >
            Total
          </span>
          <span
            className="font-bold"
            style={{
              color: "var(--store-accent)",
              fontSize: "var(--store-price-size, 0.9375rem)",
            }}
          >
            {formattedPrice}
          </span>
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading}
          className="flex-1 font-semibold"
          size="lg"
          style={{
            backgroundColor: "var(--store-accent)",
            borderColor: "var(--store-accent)",
            color: "white",
            borderRadius: "var(--store-radius, 0.5rem)",
            fontSize: "var(--store-body-size, 0.875rem)",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </div>
  );
}
