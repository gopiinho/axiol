import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation, isAuthenticated } from "@/lib/auth-server";

const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";

const isSandbox = appId.startsWith("TEST");
const baseUrl = isSandbox ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg";

const ADDRESS_PROOF_CASHFREE_FIELD: Record<string, string> = {
  aadhaar: "uidai",
  driving_license: "driving_license",
  passport: "passport_number",
  voter_id: "voter_id",
};

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return jsonError(401, "Not authenticated");
    }

    const body = await request.json();
    const {
      panNumber,
      addressProofType,
      addressProofNumber,
      businessType,
      payoutMethod,
      bankAccount,
      bankIfsc,
      bankHolder,
      upiVpa,
      upiHolder,
    } = body;

    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return jsonError(400, "Valid PAN number is required (format: ABCDE1234F)");
    }

    const validTypes = ["aadhaar", "driving_license", "passport", "voter_id"];
    if (!addressProofType || !validTypes.includes(addressProofType)) {
      return jsonError(
        400,
        "Valid address proof type is required (aadhaar, driving_license, passport, or voter_id)"
      );
    }

    if (!addressProofNumber) {
      return jsonError(400, "Address proof number is required");
    }

    if (!businessType) {
      return jsonError(400, "Business type is required");
    }

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

    const vendorId = `axiol_${profile._id}`;

    const cashfreeField = ADDRESS_PROOF_CASHFREE_FIELD[addressProofType];

    const vendorPayload: Record<string, unknown> = {
      vendor_id: vendorId,
      status: "ACTIVE",
      name: profile.name || "Creator",
      email: profile.email,
      phone: "9999999999",
      dashboard_access: false,
      schedule_option: 1,
      kyc_details: {
        account_type: "INDIVIDUAL",
        business_type: businessType,
        pan: panNumber,
        [cashfreeField]: addressProofNumber,
      },
    };

    if (payoutMethod === "bank") {
      vendorPayload.bank = {
        account_number: bankAccount,
        account_holder: bankHolder,
        ifsc: bankIfsc,
      };
      vendorPayload.verify_account = true;
    } else {
      vendorPayload.upi = {
        vpa: upiVpa,
        account_holder: upiHolder,
      };
    }

    const response = await fetch(`${baseUrl}/easy-split/vendors`, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vendorPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.code === "vendor_already_exists") {
        const existing = await fetch(`${baseUrl}/easy-split/vendors/${vendorId}`, {
          headers: {
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2025-01-01",
          },
        });
        const existingData = await existing.json();
        const vendorStatus = existingData.status || "IN_BENE_CREATION";

        await fetchAuthMutation(api.vendors.saveVendorDetails, {
          vendorId,
          vendorStatus,
          panNumber,
          addressProofType,
          addressProofNumber,
          payoutMethod,
          bankAccount: payoutMethod === "bank" ? bankAccount : undefined,
          bankIfsc: payoutMethod === "bank" ? bankIfsc : undefined,
          bankHolder: payoutMethod === "bank" ? bankHolder : undefined,
          upiVpa: payoutMethod === "upi" ? upiVpa : undefined,
          upiHolder: payoutMethod === "upi" ? upiHolder : undefined,
        });

        return NextResponse.json({
          ok: true,
          vendorId,
          status: vendorStatus,
        });
      }

      console.error("Cashfree vendor creation failed:", data);
      return jsonError(response.status, data.message || "Failed to create vendor");
    }

    const vendorStatus = data.status || "IN_BENE_CREATION";

    await fetchAuthMutation(api.vendors.saveVendorDetails, {
      vendorId,
      vendorStatus,
      panNumber,
      addressProofType,
      addressProofNumber,
      payoutMethod,
      bankAccount: payoutMethod === "bank" ? bankAccount : undefined,
      bankIfsc: payoutMethod === "bank" ? bankIfsc : undefined,
      bankHolder: payoutMethod === "bank" ? bankHolder : undefined,
      upiVpa: payoutMethod === "upi" ? upiVpa : undefined,
      upiHolder: payoutMethod === "upi" ? upiHolder : undefined,
    });

    return NextResponse.json({
      ok: true,
      vendorId,
      status: vendorStatus,
    });
  } catch (error) {
    console.error("Vendor creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create vendor";
    return jsonError(500, message);
  }
}
