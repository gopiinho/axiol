export type PayoutMethod = "bank" | "upi";

export type AddressProofType = "aadhaar" | "driving_license" | "passport" | "voter_id";

export interface PayoutFormData {
  panNumber: string;
  addressProofType: AddressProofType | "";
  addressProofNumber: string;
  businessType: string;
  payoutMethod: PayoutMethod;
  bankAccount: string;
  bankIfsc: string;
  bankHolder: string;
  upiVpa: string;
  upiHolder: string;
}

export interface PayoutProfile {
  vendorId?: string;
  vendorStatus?: string;
  panNumber?: string;
  addressProofType?: AddressProofType;
  addressProofNumber?: string;
  vendorDocumentStatus?: Record<string, string>;
  payoutMethod?: PayoutMethod;
  bankAccount?: string;
  bankIfsc?: string;
  bankHolder?: string;
  upiVpa?: string;
  upiHolder?: string;
  vendorCreatedAt?: number;
}

export function maskText(value: string | undefined | null, showStart = 2, showEnd = 4): string {
  if (!value) return "";
  if (value.length <= showStart + showEnd) return value;
  const masked = "*".repeat(Math.min(value.length - showStart - showEnd, 6));
  return value.slice(0, showStart) + masked + value.slice(-showEnd);
}
