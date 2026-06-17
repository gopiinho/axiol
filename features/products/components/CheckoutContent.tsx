"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutFields } from "@/features/products/components/CheckoutForm";
import { RichTextRenderer } from "@/features/products/components/rich-text";
import { PurchaseBar } from "@/features/products/components/StickyPurchaseBar";
import heartPixel from "@/public/icons/heart.png";

interface CheckoutContentProps {
  username: string;
  product: {
    _id: string;
    name: string;
    type: string;
    price?: string | null;
    priceCents?: number | null;
    description?: string | null;
    coverImageUrl?: string | null;
  };
  definition: {
    key: string;
    defaultButtonText: string;
    requiresPrice: boolean;
  } | null;
  hasStickyBar: boolean;
}

export function CheckoutContent({
  username,
  product,
  definition,
  hasStickyBar,
}: CheckoutContentProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const rawPrice = product.price
    ? product.price
    : product.priceCents
      ? product.priceCents > 0
        ? `${(product.priceCents / 100).toFixed(2)}`
        : null
      : null;

  const displayPrice = rawPrice ? (/^[₹$€£]/.test(rawPrice) ? rawPrice : `₹ ${rawPrice}`) : "Free";

  const ctaText = definition?.defaultButtonText ?? "Get Access";
  const isSimplifiedForm = ["collect_emails", "applications"].includes(product.type);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || loading) return;
    setLoading(true);
    // TODO: handle payment and order creation
    setLoading(false);
  };

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{ paddingBottom: hasStickyBar ? "5.5rem" : "2rem" }}
    >
      <Link
        href={`/${username}`}
        className="inline-flex items-center gap-1.5 py-3 transition-colors hover:opacity-70"
        style={{
          color: "var(--store-text-muted)",
          fontSize: "var(--store-body-size, 0.8125rem)",
        }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {product.coverImageUrl && (
        <div
          className="mb-6 overflow-hidden"
          style={{
            borderRadius: "var(--store-radius, 0.5rem)",
            marginBottom: "var(--store-section-gap, 1.5rem)",
          }}
        >
          <img
            src={product.coverImageUrl}
            alt={product.name}
            className="w-full object-cover"
            style={{ maxHeight: "24rem" }}
          />
        </div>
      )}

      <h1
        className="font-accent mb-2 leading-tight font-bold tracking-tight"
        style={{
          color: "var(--store-text)",
          fontSize: "var(--store-heading-size, 1.375rem)",
        }}
      >
        {product.name}
      </h1>

      <p
        className="mb-6 font-semibold"
        style={{
          color: "var(--store-accent)",
          fontSize: "var(--store-price-size, 0.9375rem)",
        }}
      >
        {displayPrice}
      </p>

      {product.description && (
        <div
          style={{
            marginBottom: "var(--store-section-gap, 1.5rem)",
            fontSize: "var(--store-body-size, 0.875rem)",
          }}
        >
          <RichTextRenderer html={product.description} style={{ color: "var(--store-text)" }} />
        </div>
      )}

      <div className="mb-4 border-t" style={{ borderColor: "var(--store-border)" }}>
        <h2
          className="font-semibold tracking-wide uppercase"
          style={{
            color: "var(--store-text)",
            fontSize: "var(--store-body-size, 0.8125rem)",
            marginTop: "var(--store-section-gap, 1.5rem)",
            marginBottom: "var(--store-card-gap, 1rem)",
          }}
        >
          Contact Information
        </h2>

        <CheckoutFields name={name} email={email} onNameChange={setName} onEmailChange={setEmail} />

        {isSimplifiedForm && (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full font-semibold"
            size="lg"
            style={{
              backgroundColor: "var(--store-accent)",
              borderColor: "var(--store-accent)",
              color: "white",
              borderRadius: "var(--store-radius, 0.5rem)",
              fontSize: "var(--store-body-size, 0.875rem)",
            }}
          >
            {loading ? "Submitting..." : ctaText}
          </Button>
        )}

        {isSimplifiedForm && (
          <div className="border-border/60 mt-12 border-t pt-6">
            <p
              className="text-center leading-relaxed"
              style={{
                color: "var(--store-text-muted)",
                fontSize: "var(--store-body-size, 0.8125rem)",
              }}
            >
              Powered by Axiol{" "}
              <Image
                src={heartPixel.src}
                alt="heart"
                width={5}
                height={5}
                className="inline-block h-2 w-2"
              />
            </p>
          </div>
        )}
      </div>

      {hasStickyBar && (
        <PurchaseBar
          price={displayPrice}
          buttonText={ctaText}
          loading={loading}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
