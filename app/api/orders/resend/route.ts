import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getServerConvexClient } from "@/server/convex/client";
import { sendDownloadEmail } from "@/server/email/client";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
    }

    const convex = getServerConvexClient();

    const order = await convex.query(api.orders.getById, {
      orderId: orderId as Id<"orders">,
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "paid") {
      return NextResponse.json({ ok: false, error: "Order is not paid" }, { status: 400 });
    }

    const tokenResult = await convex.mutation(api.deliveries.generateToken, {
      orderId: orderId as Id<"orders">,
    });

    const productInfo = await convex.query(api.deliveries.getProductForDelivery, {
      productId: order.productId,
    });

    const storeName = productInfo?.storeName || "Axiol";
    const productName = productInfo?.name || "your product";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    const amount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: order.currency,
    }).format(order.amount);

    const orderDate = new Date(order.paidAt ?? order.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await sendDownloadEmail(
      order.buyerEmail,
      productName,
      `${siteUrl}${tokenResult.downloadUrl}`,
      storeName,
      siteUrl,
      order.buyerName,
      amount,
      order.paymentReference ?? "",
      orderDate
    );

    await convex.mutation(api.deliveries.markDeliverySentByOrderId, {
      orderId: orderId as Id<"orders">,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
