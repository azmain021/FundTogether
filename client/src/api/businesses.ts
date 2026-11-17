import { apiRequest } from "./client";
import type { Business, BusinessInput } from "./types";

export const createBusiness = (input: BusinessInput) =>
  apiRequest<Business>("/businesses", { method: "POST", body: input });

export const listBusinesses = (signal?: AbortSignal) =>
  apiRequest<Business[]>("/businesses", { signal });

export const getBusiness = (id: string, signal?: AbortSignal) =>
  apiRequest<Business>(`/businesses/${encodeURIComponent(id)}`, { signal });

export const updateBusiness = (id: string, input: Partial<BusinessInput>) =>
  apiRequest<Business>(`/businesses/${encodeURIComponent(id)}`, { method: "PATCH", body: input });

export const deleteBusiness = (id: string) =>
  apiRequest<void>(`/businesses/${encodeURIComponent(id)}`, { method: "DELETE" });
