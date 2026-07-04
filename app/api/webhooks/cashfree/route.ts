import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/server/convex/client";
import { sendDownloadEmail } from "@/server/email/client";

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
cashfree.XApiVersion = "2025-01-01";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get("x-webhook-signature");
    const timestamp = request.headers.get("x-webhook-timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json(
        { ok: false, error: "Missing webhook signature headers" },
        { status: 400 }
      );
    }

    try {
      cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { type, data } = payload;

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const cfOrderId = data.order?.order_id;

      if (cfOrderId) {
        const convex = getServerConvexClient();
        const existing = await convex.query(api.orders.getByPaymentReference, {
          paymentReference: cfOrderId,
        });

        if (existing && existing.status === "pending") {
          await convex.mutation(api.orders.updateStatus, {
            orderId: existing._id,
            status: "paid",
          });

          try {
            const tokenResult = await convex.mutation(api.deliveries.generateToken, {
              orderId: existing._id,
            });

            const productInfo = await convex.query(api.deliveries.getProductForDelivery, {
              productId: existing.productId,
            });

            const storeName = productInfo?.storeName ?? "Axiol";
            const productName = productInfo?.name ?? "your product";
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

            await sendDownloadEmail(
              existing.buyerEmail,
              productName,
              `${siteUrl}${tokenResult.downloadUrl}`,
              storeName,
              siteUrl
            );
          } catch (e) {
            console.error("Delivery generation failed for webhook:", e);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
