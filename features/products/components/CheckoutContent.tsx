"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutFields } from "@/features/products/components/CheckoutForm";
import { RichTextRenderer } from "@/features/products/components/rich-text";
import { PurchaseBar } from "@/features/products/components/StickyPurchaseBar";

interface CheckoutContentProps {
  username: string;
  product: {
    _id: string;
    name: string;
    type: string;
    productUrl?: string | null;
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

function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.Cashfree !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
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
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const cashfreeRef = useRef<CashfreeInstance | null>(null);

  useEffect(() => {
    loadCashfreeScript().then(() => {
      if (!cashfreeRef.current && typeof window.Cashfree !== "undefined") {
        cashfreeRef.current = window.Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox",
        });
      }
    });
  }, []);

  const rawPrice = product.price
    ? product.price
    : product.priceCents && product.priceCents > 0
      ? `₹ ${product.priceCents}`
      : null;

  const displayPrice = rawPrice ? (/^[₹$€£]/.test(rawPrice) ? rawPrice : `₹ ${rawPrice}`) : "Free";

  const ctaText = definition?.defaultButtonText ?? "Get Access";
  const isSimplifiedForm = ["collect_emails", "applications"].includes(product.type);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !email.trim() || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          username,
          productUrl: product.productUrl,
          buyerName: name.trim(),
          buyerEmail: email.trim(),
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to create order");

      const cf = cashfreeRef.current;
      if (!cf) {
        setLoading(false);
        setMessage("Payment system not ready. Please try again.");
        return;
      }

      const result = await cf.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result.error) {
        setMessage("Payment was not completed.");
        return;
      }

      if (result.redirect) {
        return;
      }

      if (result.paymentDetails) {
        const verifyRes = await fetch(`/api/checkout/verify?orderId=${data.orderId}`);
        const verifyData = await verifyRes.json();

        if (verifyData.ok && verifyData.status === "paid") {
          setStatus("success");
        } else {
          setMessage("Payment failed. Please try again.");
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [name, email, loading, product._id, product.productUrl, username]);

  if (status === "success") {
    return (
      <div
        className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center text-center"
        style={{ padding: "2rem" }}
      >
        <CheckCircle2 className="mb-4 h-16 w-16" style={{ color: "var(--store-accent, #22c55e)" }} />
        <h1
          className="mb-2 text-2xl font-bold"
          style={{ color: "var(--store-text)" }}
        >
          Payment Successful!
        </h1>
        <p className="mb-6" style={{ color: "var(--store-text-muted)" }}>
          Thank you for your purchase of <strong>{product.name}</strong>.
          You&apos;ll receive a confirmation at {email}.
        </p>
        <Link href={`/${username}`}>
          <Button
            style={{
              backgroundColor: "var(--store-accent)",
              borderColor: "var(--store-accent)",
              color: "white",
            }}
          >
            Back to Store
          </Button>
        </Link>
      </div>
    );
  }

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
          <RichTextRenderer
            html={product.description}
            className="product-description"
            style={{ color: "var(--store-text)" }}
          />
        </div>
      )}

      {message && (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg p-3 text-sm"
          style={{
            backgroundColor: "oklch(0.93 0.03 20 / 0.15)",
            color: "oklch(0.5 0.15 20)",
            border: "1px solid oklch(0.8 0.08 20 / 0.3)",
          }}
        >
          <XCircle className="h-4 w-4 shrink-0" />
          {message}
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
