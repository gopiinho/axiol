"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckoutFieldsProps {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  showPhone?: boolean;
  phoneRequired?: boolean;
  errors?: Record<string, boolean>;
}

export function CheckoutFields({
  name,
  email,
  onNameChange,
  onEmailChange,
  phone = "",
  onPhoneChange,
  showPhone = false,
  phoneRequired = false,
  errors = {},
}: CheckoutFieldsProps) {
  return (
    <div className="space-y-4" style={{ fontSize: "var(--store-body-size, 0.875rem)" }}>
      <div className="space-y-2">
        <Label
          htmlFor="checkout-name"
          style={{ color: errors.name ? "#ef4444" : "var(--store-text)" }}
        >
          Name *
        </Label>
        <Input
          id="checkout-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Your name"
          required
          className={cn(errors.name && "border-red-500 focus-visible:ring-red-500/40")}
          style={{
            borderColor: errors.name ? "#ef4444" : "var(--store-border)",
            backgroundColor: "var(--store-surface)",
            color: "var(--store-text)",
            borderRadius: "var(--store-radius, 0.5rem)",
          }}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="checkout-email"
          style={{ color: errors.email ? "#ef4444" : "var(--store-text)" }}
        >
          Email *
        </Label>
        <Input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          required
          className={cn(errors.email && "border-red-500 focus-visible:ring-red-500/40")}
          style={{
            borderColor: errors.email ? "#ef4444" : "var(--store-border)",
            backgroundColor: "var(--store-surface)",
            color: "var(--store-text)",
            borderRadius: "var(--store-radius, 0.5rem)",
          }}
        />
      </div>

      {showPhone && (
        <div className="space-y-2">
          <Label
            htmlFor="checkout-phone"
            style={{ color: errors.phone ? "#ef4444" : "var(--store-text)" }}
          >
            Phone number *
          </Label>
          <Input
            id="checkout-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange?.(e.target.value)}
            placeholder="+91 9876543210"
            required
            className={cn(errors.phone && "border-red-500 focus-visible:ring-red-500/40")}
            style={{
              borderColor: errors.phone ? "#ef4444" : "var(--store-border)",
              backgroundColor: "var(--store-surface)",
              color: "var(--store-text)",
              borderRadius: "var(--store-radius, 0.5rem)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export { type CheckoutFieldsProps };
