// Shared status and classification values used by schemas (Models), DTOs and
// services. Agree on changes with the team: the React client mirrors these
// values in client/src/api/types.ts.

export enum UserRole {
  Investor = 'investor',
  BusinessOwner = 'business_owner',
  Admin = 'admin',
}

export enum BusinessType {
  SoleProprietorship = 'sole_proprietorship',
  Partnership = 'partnership',
  PrivateLimited = 'private_limited',
  Cooperative = 'cooperative',
  Other = 'other',
}

export enum BusinessSector {
  GroceryRetail = 'grocery_retail',
  RestaurantFood = 'restaurant_food',
  Bakery = 'bakery',
  ClothingFashion = 'clothing_fashion',
  Agriculture = 'agriculture',
  Manufacturing = 'manufacturing',
  RenewableEnergy = 'renewable_energy',
  TransportationDelivery = 'transportation_delivery',
  Other = 'other',
}

export enum BusinessSize {
  Micro = 'micro',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum VerificationStatus {
  Draft = 'draft',
  Pending = 'pending',
  ChangesRequested = 'changes_requested',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum CampaignStatus {
  Draft = 'draft',
  PendingReview = 'pending_review',
  Rejected = 'rejected',
  Approved = 'approved',
  Active = 'active',
  Funded = 'funded',
  Expired = 'expired',
  Closed = 'closed',
}
