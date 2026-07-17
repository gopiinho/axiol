import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/server/convex/client";
import { parsePriceRupees } from "@/lib/validators/price";

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

if (!appId || !secretKey) {
  throw new Error("CASHFREE_APP_ID or CASHFREE_SECRET_KEY is not configured");
}

const cashfree = new Cashfree(
  appId.startsWith("TEST") ? CFEnvironment.SANDBOX : CFEnvironment.PRODUCTION,
  appId,
  secretKey
);

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, username, productUrl, buyerName, buyerEmail, buyerPhone } = body;

    if (!productId || !username || !productUrl || !buyerName?.trim() || !buyerEmail?.trim()) {
      return jsonError(
        400,
        "Missing required fields: productId, username, productUrl, buyerName, buyerEmail"
      );
    }

    const convex = getServerConvexClient();

    const data = await convex.query(api.products.getPublicProduct, {
      username,
      productUrl,
    });

    if (!data || !data.product) {
      return jsonError(404, "Product not found");
    }

    const product = data.product;
    const amountCents = product.priceCents ?? parsePriceRupees(product.price);
    if (!amountCents || amountCents <= 0) {
      return jsonError(400, "Product is not priced");
    }

    const creator = await convex.query(api.vendors.getPayoutProfileForOrder, {
      userId: product.createdBy,
    });

    const orderId = `axiol_${productId}_${Date.now()}`;

    const isPro = creator?.subscriptionStatus === "active";
    const platformFeePct = isPro ? 0 : 10;
    const platformFee = Math.round((amountCents * platformFeePct) / 100);
    const tds = Math.round(amountCents * 0.01);
    const vendorNet = amountCents - platformFee - tds;

    const hasActiveVendor = creator?.vendorId && creator?.vendorStatus === "ACTIVE";

    const cashfreeOrder = await cashfree.PGCreateOrder({
      order_id: orderId,
      order_amount: amountCents,
      order_currency: "INR",
      customer_details: {
        customer_id: `buyer_${Date.now()}`,
        customer_name: buyerName.trim(),
        customer_email: buyerEmail.trim(),
        customer_phone: buyerPhone?.trim() || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL}/${username}/p/${productUrl}`,
      },
      ...(hasActiveVendor && creator?.vendorId
        ? {
            order_splits: [{ vendor_id: creator.vendorId, amount: vendorNet }],
          }
        : {}),
    });

    const order = await convex.mutation(api.orders.create, {
      productId: product._id,
      sellerId: product.createdBy,
      buyerEmail: buyerEmail.trim(),
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone?.trim() || undefined,
      amountCents,
      currency: "INR",
      paymentProvider: "cashfree",
      paymentReference: cashfreeOrder.data.order_id || "",
      vendorId: creator?.vendorId,
      vendorShareCents: hasActiveVendor ? vendorNet : undefined,
      platformFeeCents: hasActiveVendor ? platformFee : undefined,
      platformFeePct: hasActiveVendor ? platformFeePct : undefined,
      tdsCents: hasActiveVendor ? tds : undefined,
    });

    return NextResponse.json({
      ok: true,
      paymentSessionId: cashfreeOrder.data.payment_session_id,
      orderId: order,
    });
  } catch (error: unknown) {
    console.error("Create order error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return jsonError(500, message);
  }
}
