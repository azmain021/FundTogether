import { apiRequest } from "./client";
import type { Campaign, CampaignInput, CampaignQueueItem, CampaignReview, CampaignStatus, PublishedCampaign, PublishedCampaignDetail } from "./types";

export const createCampaign = (input: CampaignInput) =>
  apiRequest<Campaign>("/campaigns", { method: "POST", body: input });

export const listMyCampaigns = (status?: CampaignStatus, signal?: AbortSignal) =>
  apiRequest<Campaign[]>(status ? `/campaigns/mine?status=${encodeURIComponent(status)}` : "/campaigns/mine", { signal });

export const getCampaign = (id: string, signal?: AbortSignal) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { signal });

export const updateCampaign = (id: string, input: Partial<Omit<CampaignInput, "businessId">>) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { method: "PATCH", body: input });

export const deleteCampaign = (id: string) =>
  apiRequest<void>(`/campaigns/${encodeURIComponent(id)}`, { method: "DELETE" });

export const submitCampaign = (id: string) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}/submit`, { method: "POST" });

export const getCampaignReviewQueue = (signal?: AbortSignal) =>
  apiRequest<CampaignQueueItem[]>("/admin/campaigns?status=pending_review", { signal });

export const decideCampaign = (id: string, input: Pick<CampaignReview, "decision" | "version" | "feedback">) =>
  apiRequest<Campaign>(`/admin/campaigns/${encodeURIComponent(id)}/review`, { method: "PATCH", body: input });

export const listPublishedCampaigns = (signal?: AbortSignal) =>
  apiRequest<PublishedCampaign[]>("/marketplace/campaigns", { signal });

export const getPublishedCampaign = (id: string, signal?: AbortSignal) =>
  apiRequest<PublishedCampaignDetail>(`/marketplace/campaigns/${encodeURIComponent(id)}`, { signal });
