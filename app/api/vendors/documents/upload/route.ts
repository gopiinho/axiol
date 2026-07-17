import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

const isSandbox = appId.startsWith("TEST");
const baseUrl = isSandbox ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return jsonError(401, "Not authenticated");
    }

    const payoutProfile = await fetchAuthQuery(api.vendors.getPayoutProfile);
    if (!payoutProfile?.vendorId) {
      return jsonError(400, "No vendor found. Create a vendor first.");
    }

    const formData = await request.formData();
    const docType = formData.get("doc_type") as string | null;
    const file = formData.get("file") as File | null;
    const docValue = formData.get("doc_value") as string | null;

    if (!docType) {
      return jsonError(400, "doc_type is required");
    }

    const cashfreeForm = new FormData();
    cashfreeForm.append("doc_type", docType);

    if (docType.endsWith("_NUMBER")) {
      if (!docValue) {
        return jsonError(400, "doc_value is required for this doc_type");
      }
      cashfreeForm.append("doc_value", docValue);
    } else {
      if (!file) {
        return jsonError(400, "file is required for this doc_type");
      }
      if (file.size > 2 * 1024 * 1024) {
        return jsonError(400, "File size must not exceed 2MB");
      }
      cashfreeForm.append("file", file);
      if (docValue) {
        cashfreeForm.append("doc_value", docValue);
      }
    }

    const response = await fetch(`${baseUrl}/easy-split/vendor-docs/${payoutProfile.vendorId}`, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2025-01-01",
      },
      body: cashfreeForm,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree document upload failed:", data);
      return NextResponse.json(
        { ok: false, error: data.message || "Failed to upload document" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      doc_type: data.doc_type,
      status: data.status,
      remarks: data.remarks,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload document";
    return jsonError(500, message);
  }
}
