import type { AddressProofType } from "./types";

export const BUSINESS_TYPES = [
  "Digital Goods",
  "E-commerce",
  "SaaS",
  "Professional Services (Doctors, Lawyers, Architects, CAs, and other Professionals)",
  "Social Media and Entertainment",
  "Miscellaneous",
] as const;

export const ADDRESS_PROOF_OPTIONS = [
  { value: "aadhaar", label: "Aadhaar Card", icon: "Fingerprint" },
  { value: "driving_license", label: "Driving License", icon: "Car" },
  { value: "passport", label: "Passport", icon: "BookOpen" },
  { value: "voter_id", label: "Voter ID", icon: "IdCard" },
] as const;

export const ADDRESS_PROOF_CASHFREE_FIELD: Record<AddressProofType, string> = {
  aadhaar: "uidai",
  driving_license: "driving_license",
  passport: "passport_number",
  voter_id: "voter_id",
};

export const ADDRESS_PROOF_FILE_TYPES: Record<AddressProofType, { docType: string; label: string }[]> = {
  aadhaar: [
    { docType: "UIDAI_FRONT", label: "Aadhaar Card — Front" },
    { docType: "UIDAI_BACK", label: "Aadhaar Card — Back" },
  ],
  driving_license: [
    { docType: "DL", label: "Driving License" },
  ],
  passport: [
    { docType: "PASSPORT_FRONT", label: "Passport — Front" },
    { docType: "PASSPORT_BACK", label: "Passport — Back" },
  ],
  voter_id: [
    { docType: "VOTER_ID", label: "Voter ID" },
  ],
};

export const EMPTY_FORM: import("./types").PayoutFormData = {
  panNumber: "",
  addressProofType: "",
  addressProofNumber: "",
  businessType: "",
  payoutMethod: "bank",
  bankAccount: "",
  bankIfsc: "",
  bankHolder: "",
  upiVpa: "",
  upiHolder: "",
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  PAN: "PAN Card",
  PAN_NUMBER: "PAN Number",
  UIDAI_FRONT: "Aadhaar — Front",
  UIDAI_BACK: "Aadhaar — Back",
  UIDAI_NUMBER: "Aadhaar Number",
  DL: "Driving License",
  DL_NUMBER: "Driving License Number",
  PASSPORT_FRONT: "Passport — Front",
  PASSPORT_BACK: "Passport — Back",
  PASSPORT_NUMBER: "Passport Number",
  VOTER_ID: "Voter ID",
  VOTER_ID_NUMBER: "Voter ID Number",
};
