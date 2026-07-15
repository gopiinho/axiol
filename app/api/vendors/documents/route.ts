import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

const isSandbox = appId.startsWith("TEST");
const baseUrl = isSandbox
  ? "https://sandbox.cashfree.com/pg"
  : "https://api.cashfree.com/pg";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return jsonError(401, "Not authenticated");
    }

    const payoutProfile = await fetchAuthQuery(api.vendors.getPayoutProfile);
    if (!payoutProfile?.vendorId) {
      return NextResponse.json({ ok: true, documents: [] });
    }

    const response = await fetch(
      `${baseUrl}/easy-split/vendor-docs/${payoutProfile.vendorId}`,
      {
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2025-01-01",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ ok: true, documents: [] });
    }

    const data = await response.json();
    const documents = data.documents || data.related_docs || [];

    return NextResponse.json({ ok: true, documents });
  } catch (error) {
    console.error("Vendor documents error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch documents";
    return jsonError(500, message);
  }
}
