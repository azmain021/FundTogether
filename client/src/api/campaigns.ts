import { apiRequest } from "./client";
import type { Campaign, CampaignInput } from "./types";

export const createCampaign = (input: CampaignInput) =>
  apiRequest<Campaign>("/campaigns", { method: "POST", body: input });

export const listCampaigns = (businessId?: string, signal?: AbortSignal) =>
  apiRequest<Campaign[]>(
    businessId ? `/campaigns?businessId=${encodeURIComponent(businessId)}` : "/campaigns",
    { signal },
  );

export const getCampaign = (id: string, signal?: AbortSignal) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { signal });

export const updateCampaign = (id: string, input: Partial<Omit<CampaignInput, "businessId">>) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { method: "PATCH", body: input });

export const deleteCampaign = (id: string) =>
  apiRequest<void>(`/campaigns/${encodeURIComponent(id)}`, { method: "DELETE" });
