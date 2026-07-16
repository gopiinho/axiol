"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutFields } from "@/features/products/components/CheckoutForm";

interface CheckoutSidebarProps {
  price: string;
  ctaText: string;
  loading?: boolean;
  disabled?: boolean;
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  showPrice?: boolean;
  phone?: string;
  onPhoneChange?: (phone: string) => void;
  showPhone?: boolean;
  phoneRequired?: boolean;
  errors?: Record<string, boolean>;
}

export function CheckoutSidebar({
  price,
  ctaText,
  loading = false,
  disabled = false,
  name,
  email,
  onNameChange,
  onEmailChange,
  onSubmit,
  showPrice = true,
  phone = "",
  onPhoneChange,
  showPhone = false,
  phoneRequired = false,
  errors = {},
}: CheckoutSidebarProps) {
  const formattedPrice = /^[₹$€£]/.test(price) ? price : `₹ ${price}`;

  return (
    <div
      className="sticky top-6 flex flex-col gap-4 rounded-lg border"
      style={{
        backgroundColor: "var(--store-surface, #f9fafb)",
        borderColor: "var(--store-border, oklch(0.82 0.01 0 / 0.35))",
        borderRadius: "var(--store-radius, 0.5rem)",
        padding: "var(--store-card-padding, 1rem)",
      }}
    >
      {showPrice && (
        <div className="flex items-center justify-between">
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
      )}

      <h2
        className="font-semibold tracking-wide uppercase"
        style={{
          color: "var(--store-text)",
          fontSize: "var(--store-body-size, 0.8125rem)",
        }}
      >
        Billing Information
      </h2>

      <CheckoutFields
        name={name}
        email={email}
        onNameChange={onNameChange}
        onEmailChange={onEmailChange}
        phone={phone}
        onPhoneChange={onPhoneChange}
        showPhone={showPhone}
        phoneRequired={phoneRequired}
        errors={errors}
      />

      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled || loading}
        className="w-full font-semibold"
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
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          ctaText
        )}
      </Button>
    </div>
  );
}

export function PurchaseBar({
  price,
  buttonText,
  loading = false,
  disabled = false,
  onSubmit,
}: {
  price: string;
  buttonText: string;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
}) {
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
        className="mx-auto flex w-full items-center gap-4 px-4 py-3 lg:max-w-[30%]"
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
