import { apiRequest } from "./client";
import type { WatchlistItem } from "./types";

export const listWatchlist = (signal?: AbortSignal) =>
  apiRequest<WatchlistItem[]>("/watchlist", { signal });

export const addToWatchlist = (campaignId: string) =>
  apiRequest<WatchlistItem>("/watchlist", {
    method: "POST",
    body: { campaignId },
  });

export const removeFromWatchlist = (campaignId: string) =>
  apiRequest<void>(`/watchlist/${encodeURIComponent(campaignId)}`, {
    method: "DELETE",
  });