import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getServerConvexClient } from "@/server/convex/client";

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

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
    }

    const convex = getServerConvexClient();

    const order = await convex.query(api.orders.getById, {
      orderId: orderId as Id<"orders">,
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      try {
        const tokenResult = await convex.mutation(api.deliveries.generateToken, {
          orderId: order._id,
        });
        return NextResponse.json({
          ok: true,
          status: "paid",
          downloadUrl: tokenResult.downloadUrl,
        });
      } catch {
        return NextResponse.json({ ok: true, status: "paid" });
      }
    }

    const cfOrderId = order.paymentReference;
    if (!cfOrderId) {
      return NextResponse.json({ ok: true, status: order.status });
    }

    const cashfreeOrder = await cashfree.PGFetchOrder(cfOrderId);

    const cfStatus = cashfreeOrder.data.order_status;

    if (cfStatus === "PAID") {
      await convex.mutation(api.orders.updateStatus, {
        orderId: order._id,
        status: "paid",
      });

      let downloadUrl: string | undefined;
      try {
        const tokenResult = await convex.mutation(api.deliveries.generateToken, {
          orderId: order._id,
        });
        downloadUrl = tokenResult.downloadUrl;
      } catch {
        // Token generation is best-effort for verify
      }

      return NextResponse.json({ ok: true, status: "paid", downloadUrl });
    }

    if (cfStatus === "ACTIVE" || cfStatus === "PENDING") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    await convex.mutation(api.orders.updateStatus, {
      orderId: order._id,
      status: "failed",
    });

    return NextResponse.json({ ok: true, status: "failed" });
  } catch (error: unknown) {
    console.error("Verify order error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify order";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
