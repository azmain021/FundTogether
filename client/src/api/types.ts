// Mirrors server/src/common/enums.ts and the server's Mongoose schemas.
// Keep both sides in sync when a field or status changes.

export type BusinessType =
  | "sole_proprietorship"
  | "partnership"
  | "private_limited"
  | "cooperative"
  | "other";

export type BusinessSector =
  | "grocery_retail"
  | "restaurant_food"
  | "bakery"
  | "clothing_fashion"
  | "agriculture"
  | "manufacturing"
  | "renewable_energy"
  | "transportation_delivery"
  | "other";

export type BusinessSize = "micro" | "small" | "medium" | "large";

export type VerificationStatus = "draft" | "pending" | "changes_requested" | "approved" | "rejected";

export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "rejected"
  | "approved"
  | "active"
  | "funded"
  | "expired"
  | "closed";

export type BusinessInput = {
  officialName: string;
  businessType: BusinessType;
  sector: BusinessSector;
  size: BusinessSize;
  establishedYear: number;
  operatingHistory?: string;
  employeeCount: number;
  division: string;
  district: string;
  address: string;
  description: string;
  website?: string | null;
  businessEmail: string;
  contactPhone: string;
};

export type Business = BusinessInput & {
  _id: string;
  ownerId?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignInput = {
  businessId: string;
  title: string;
  description: string;
  purpose: string;
  useOfFunds: string;
  fundingTarget: number;
  unitPrice: number;
  durationDays: number;
};

export type Campaign = CampaignInput & {
  _id: string;
  ownerId?: string;
  totalUnits: number;
  remainingUnits: number;
  status: CampaignStatus;
  version: number;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};
