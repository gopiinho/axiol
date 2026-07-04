"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RichTextRenderer } from "@/features/products/components/rich-text";
import { CheckoutSidebar } from "@/features/products/components/StickyPurchaseBar";
import { CheckoutSuccessCard } from "@/features/products/components/CheckoutSuccessCard";

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
    config?: Record<string, unknown>;
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
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const cashfreeRef = useRef<CashfreeInstance | null>(null);

  const checkoutConfig = product.config?.checkout as
    | { buttonText?: string; collectFields?: Array<{ key: string; enabled: boolean; required: boolean }> }
    | undefined;

  const collectFields = checkoutConfig?.collectFields ?? [];
  const phoneField = collectFields.find((f) => f.key === "phone");
  const showPhone = phoneField?.enabled ?? false;
  const phoneRequired = phoneField?.required ?? false;

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

  const ctaText = checkoutConfig?.buttonText || (definition?.defaultButtonText ?? "Get Access");

  const handleSubmit = useCallback(async () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!email.trim()) newErrors.email = true;
    if (showPhone && !phone.trim()) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (loading) return;

    setErrors({});
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
          buyerPhone: phone.trim() || undefined,
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
          setDownloadUrl(verifyData.downloadUrl ?? null);
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
  }, [
    name,
    email,
    phone,
    loading,
    showPhone,
    phoneRequired,
    product._id,
    product.productUrl,
    username,
  ]);

  if (status === "success") {
    return (
      <CheckoutSuccessCard
        productName={product.name}
        downloadUrl={downloadUrl}
        buyerEmail={email}
        username={username}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col px-3 py-4">
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

      <div className="flex flex-col md:grid md:grid-cols-[1fr_340px] md:items-start md:gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div>
          {product.coverImageUrl && (
            <div
              className="overflow-hidden"
              style={{
                borderRadius: "var(--store-radius, 0.5rem)",
                marginBottom: "var(--store-section-gap, 1.5rem)",
              }}
            >
              <div className="aspect-3/1">
                <img
                  src={product.coverImageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <h1
            className="mb-2 leading-tight font-bold tracking-tight"
            style={{
              color: "var(--store-text)",
              fontSize: "var(--store-heading-size, 1.375rem)",
            }}
          >
            {product.name}
          </h1>

          {!hasStickyBar && (
            <p
              className="mb-6 font-semibold"
              style={{
                color: "var(--store-accent)",
                fontSize: "var(--store-price-size, 0.9375rem)",
              }}
            >
              {displayPrice}
            </p>
          )}

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
        </div>

        <div>
          <CheckoutSidebar
            price={displayPrice}
            ctaText={ctaText}
            loading={loading}
            message={message}
            name={name}
            email={email}
            phone={phone}
            onNameChange={(v) => {
              setName(v);
              setErrors((prev) => ({ ...prev, name: false }));
            }}
            onEmailChange={(v) => {
              setEmail(v);
              setErrors((prev) => ({ ...prev, email: false }));
            }}
            onPhoneChange={(v) => {
              setPhone(v);
              setErrors((prev) => ({ ...prev, phone: false }));
            }}
            onSubmit={handleSubmit}
            showPrice={hasStickyBar}
            showPhone={showPhone}
            phoneRequired={phoneRequired}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
