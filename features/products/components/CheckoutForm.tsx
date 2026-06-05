"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Download } from "lucide-react";

interface CheckoutFormProps {
  product: {
    _id: string;
    name: string;
    price?: string | null;
    priceCents?: number | null;
    description?: string | null;
  };
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const displayPrice = product.price
    ? product.price
    : product.priceCents
    ? `$${(product.priceCents / 100).toFixed(2)}`
    : "Free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || loading) return;
    setLoading(true);
    // Future: handle payment and order creation
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <span className="text-2xl font-bold text-primary">{displayPrice}</span>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground mb-6">
            {product.description}
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-name">Name</Label>
            <Input
              id="checkout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {product.priceCents && product.priceCents > 0
                ? `Pay ${displayPrice}`
                : "Get Access"}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-1.5 mt-4">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Secure checkout
          </p>
        </div>
      </div>
    </form>
  );
}
