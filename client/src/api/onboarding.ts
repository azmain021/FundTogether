import { API_BASE_URL, ApiError, apiRequest } from './client';
import type { Business } from './types';

export type DocumentType = 'trade_licence' | 'tax_evidence' | 'owner_identity' | 'bank_account_evidence' | 'address_proof' | 'other_supporting';
export type StoredDocument = {
  _id: string; businessId: string; type: DocumentType; originalName: string;
  mimeType: string; sizeBytes: number; status: string; isCurrent: boolean;
  createdAt: string; replacesDocumentId?: string; reviewNote?: string;
};
export type Eligibility = { eligible: boolean; missingFields: string[]; missingDocuments: DocumentType[]; rejectedDocuments: DocumentType[] };
export type BusinessApplication = {
  _id: string; round: number; status: string; submittedAt: string;
  checklist: string[]; decisionReason?: string; decidedAt?: string;
};
export type RegistrationStatus = {
  business: Business; application: BusinessApplication | null;
  documents: StoredDocument[]; eligibility: Eligibility;
};

export const getRegistrationStatus = (id: string, signal?: AbortSignal) =>
  apiRequest<RegistrationStatus>(`/businesses/${encodeURIComponent(id)}/applications/current`, { signal });
export const submitBusinessApplication = (id: string) =>
  apiRequest<BusinessApplication>(`/businesses/${encodeURIComponent(id)}/applications`, { method: 'POST' });
export const removeDocument = (id: string) =>
  apiRequest<void>(`/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const documentDownloadUrl = (id: string) => `${API_BASE_URL}/documents/${encodeURIComponent(id)}/download`;

export function uploadDocument(businessId: string, type: DocumentType, file: File, onProgress: (percent: number) => void, replacesDocumentId?: string): Promise<StoredDocument> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('type', type);
    body.append('file', file);
    if (replacesDocumentId) body.append('replacesDocumentId', replacesDocumentId);
    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/documents`);
    request.withCredentials = true;
    request.timeout = 120_000;
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    request.onerror = () => reject(new ApiError(0, 'Could not reach the server. Please try uploading again.'));
    request.ontimeout = () => reject(new ApiError(0, 'The upload timed out. Refresh the documents before retrying.'));
    request.onload = () => {
      let data: unknown;
      try { data = JSON.parse(request.responseText); } catch { reject(new ApiError(request.status, 'The server could not process this upload')); return; }
      if (request.status >= 200 && request.status < 300) { resolve(data as StoredDocument); return; }
      const message = (data as { message?: string | string[] })?.message;
      reject(new ApiError(request.status, Array.isArray(message) ? message.join(' ') : message || 'The upload failed'));
    };
    request.send(body);
  });
}
