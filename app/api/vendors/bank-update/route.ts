import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation, isAuthenticated } from "@/lib/auth-server";

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

const isSandbox = appId.startsWith("TEST");
const baseUrl = isSandbox
  ? "https://sandbox.cashfree.com/pg"
  : "https://api.cashfree.com/pg";

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function PATCH(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return jsonError(401, "Not authenticated");
    }

    const payoutProfile = await fetchAuthQuery(api.vendors.getPayoutProfile);
    if (!payoutProfile?.vendorId) {
      return jsonError(400, "No vendor found to update");
    }

    const body = await request.json();
    const { payoutMethod, bankAccount, bankIfsc, bankHolder, upiVpa, upiHolder } = body;

    if (payoutMethod === "bank") {
      if (!bankAccount || !bankIfsc || !bankHolder) {
        return jsonError(400, "Bank account number, IFSC, and account holder name are required");
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc)) {
        return jsonError(400, "Valid IFSC code is required (11 characters)");
      }
    } else if (payoutMethod === "upi") {
      if (!upiVpa || !upiHolder) {
        return jsonError(400, "UPI VPA and account holder name are required");
      }
      if (!upiVpa.includes("@")) {
        return jsonError(400, "Valid UPI VPA is required (e.g. name@upi)");
      }
    } else {
      return jsonError(400, "Payout method must be 'bank' or 'upi'");
    }

    const profile = await fetchAuthQuery(api.users.getProfile);
    if (!profile) {
      return jsonError(401, "Not authenticated");
    }

    const vendorPayload: Record<string, unknown> = {
      status: "ACTIVE",
      verify_account: true,
      name: profile.name || "Creator",
      email: profile.email,
      phone: "9999999999",
    };

    if (payoutMethod === "bank") {
      vendorPayload.bank = {
        account_number: bankAccount,
        account_holder: bankHolder,
        ifsc: bankIfsc,
      };
    } else {
      vendorPayload.upi = {
        vpa: upiVpa,
        account_holder: upiHolder,
      };
    }

    const response = await fetch(
      `${baseUrl}/easy-split/vendors/${payoutProfile.vendorId}`,
      {
        method: "PATCH",
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2025-01-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree vendor bank update failed:", data);
      return jsonError(
        response.status,
        data.message || data.code || "Failed to update vendor"
      );
    }

    const vendorStatus = data.status || payoutProfile.vendorStatus || "IN_BENE_CREATION";

    await fetchAuthMutation(api.vendors.saveVendorDetails, {
      vendorId: payoutProfile.vendorId,
      vendorStatus,
      panNumber: payoutProfile.panNumber || "",
      addressProofType: payoutProfile.addressProofType || undefined,
      addressProofNumber: payoutProfile.addressProofNumber || undefined,
      payoutMethod,
      bankAccount: payoutMethod === "bank" ? bankAccount : undefined,
      bankIfsc: payoutMethod === "bank" ? bankIfsc : undefined,
      bankHolder: payoutMethod === "bank" ? bankHolder : undefined,
      upiVpa: payoutMethod === "upi" ? upiVpa : undefined,
      upiHolder: payoutMethod === "upi" ? upiHolder : undefined,
    });

    return NextResponse.json({
      ok: true,
      vendorId: payoutProfile.vendorId,
      status: vendorStatus,
    });
  } catch (error) {
    console.error("Vendor bank update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update vendor";
    return jsonError(500, message);
  }
}
