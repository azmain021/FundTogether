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

export enum DocumentStatus {
  Uploaded = 'uploaded',
  Accepted = 'accepted',
  ReplacementRequested = 'replacement_requested',
  Rejected = 'rejected',
  Superseded = 'superseded',
}

export enum ApplicationStatus {
  Submitted = 'submitted',
  UnderReview = 'under_review',
  ChangesRequested = 'changes_requested',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum ReviewDecision {
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum DocumentReviewDecision {
  Accepted = 'accepted',
  ReplacementRequested = 'replacement_requested',
  Rejected = 'rejected',
}

export enum TransactionType {
  StarterCredit = 'starter_credit',
  InvestmentDebit = 'investment_debit',
}

export enum InvestmentStatus {
  Confirmed = 'confirmed',
}

export enum AnalyticsReportStatus {
  Generated = 'generated',
  Failed = 'failed',
}

export enum NotificationType {
  ApplicationSubmitted = 'application_submitted',
  DocumentReplacementRequested = 'document_replacement_requested',
  BusinessApproved = 'business_approved',
  BusinessRejected = 'business_rejected',
  CampaignApproved = 'campaign_approved',
  CampaignRejected = 'campaign_rejected',
  CampaignFunded = 'campaign_funded',
  CampaignExpired = 'campaign_expired',
  InvestmentConfirmed = 'investment_confirmed',
  NewInvestment = 'new_investment',
}

export enum AuditAction {
  ApplicationSubmitted = 'APPLICATION_SUBMITTED',
  DocumentReviewed = 'DOCUMENT_REVIEWED',
  ChangesRequested = 'CHANGES_REQUESTED',
  BusinessApproved = 'BUSINESS_APPROVED',
  BusinessRejected = 'BUSINESS_REJECTED',
  CampaignSubmitted = 'CAMPAIGN_SUBMITTED',
  CampaignApproved = 'CAMPAIGN_APPROVED',
  CampaignRejected = 'CAMPAIGN_REJECTED',
  CampaignStatusChanged = 'CAMPAIGN_STATUS_CHANGED',
  WalletCreated = 'WALLET_CREATED',
  InvestmentCreated = 'INVESTMENT_CREATED',
  AdminLogin = 'ADMIN_LOGIN',
}
