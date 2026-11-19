import { apiRequest } from "./client";
import type {
  Campaign,
  CampaignInput,
  CampaignQueueItem,
  CampaignReview,
  CampaignStatus,
  MarketplaceCampaignQuery,
  MarketplaceCampaignResponse,
  PublishedCampaignDetail,
} from "./types";

export const createCampaign = (input: CampaignInput) =>
  apiRequest<Campaign>("/campaigns", { method: "POST", body: input });

export const listMyCampaigns = (status?: CampaignStatus, signal?: AbortSignal) =>
  apiRequest<Campaign[]>(
    status ? `/campaigns/mine?status=${encodeURIComponent(status)}` : "/campaigns/mine",
    { signal },
  );

export const getCampaign = (id: string, signal?: AbortSignal) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { signal });

export const updateCampaign = (
  id: string,
  input: Partial<Omit<CampaignInput, "businessId">>,
) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input,
  });

export const deleteCampaign = (id: string) =>
  apiRequest<void>(`/campaigns/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const submitCampaign = (id: string) =>
  apiRequest<Campaign>(`/campaigns/${encodeURIComponent(id)}/submit`, {
    method: "POST",
  });

export const getCampaignReviewQueue = (signal?: AbortSignal) =>
  apiRequest<CampaignQueueItem[]>("/admin/campaigns?status=pending_review", {
    signal,
  });

export const decideCampaign = (
  id: string,
  input: Pick<CampaignReview, "decision" | "version" | "feedback">,
) =>
  apiRequest<Campaign>(`/admin/campaigns/${encodeURIComponent(id)}/review`, {
    method: "PATCH",
    body: input,
  });

export const listPublishedCampaigns = (
  query: MarketplaceCampaignQuery = {},
  signal?: AbortSignal,
) => {
  const params = new URLSearchParams();

  const entries: Array<[string, string | number | undefined]> = [
    ["q", query.q],
    ["sector", query.sector],
    ["division", query.division],
    ["district", query.district],
    ["minTarget", query.minTarget],
    ["maxTarget", query.maxTarget],
    ["status", query.status],
    ["sort", query.sort],
    ["page", query.page],
    ["limit", query.limit],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return apiRequest<MarketplaceCampaignResponse>(
    `/marketplace/campaigns${suffix}`,
    { signal },
  );
};

export const getPublishedCampaign = (id: string, signal?: AbortSignal) =>
  apiRequest<PublishedCampaignDetail>(
    `/marketplace/campaigns/${encodeURIComponent(id)}`,
    { signal },
  );