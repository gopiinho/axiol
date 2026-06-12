"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutFieldsProps {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export function CheckoutFields({
  name,
  email,
  onNameChange,
  onEmailChange,
}: CheckoutFieldsProps) {
  return (
    <div
      className="space-y-4"
      style={{ fontSize: "var(--store-body-size, 0.875rem)" }}
    >
      <div className="space-y-2">
        <Label
          htmlFor="checkout-name"
          style={{ color: "var(--store-text)" }}
        >
          Name
        </Label>
        <Input
          id="checkout-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Your name"
          required
          style={{
            borderColor: "var(--store-border)",
            backgroundColor: "var(--store-surface)",
            color: "var(--store-text)",
            borderRadius: "var(--store-radius, 0.5rem)",
          }}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="checkout-email"
          style={{ color: "var(--store-text)" }}
        >
          Email
        </Label>
        <Input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          required
          style={{
            borderColor: "var(--store-border)",
            backgroundColor: "var(--store-surface)",
            color: "var(--store-text)",
            borderRadius: "var(--store-radius, 0.5rem)",
          }}
        />
      </div>
    </div>
  );
}

export { type CheckoutFieldsProps };
