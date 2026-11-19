import { apiRequest } from "./client";
import type { Campaign, CampaignInput, CampaignStatus } from "./types";

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
