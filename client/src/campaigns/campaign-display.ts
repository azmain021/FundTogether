import { ApiError } from '../api/client';
import type { CampaignStatus } from '../api/types';

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  rejected: 'Rejected',
  approved: 'Approved',
  active: 'Active',
  funded: 'Funded',
  expired: 'Expired',
  closed: 'Closed',
};

export const isDraftEditable = (status: CampaignStatus) => status === 'draft' || status === 'rejected';

export function campaignErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.details.length) return error.details.join(' ');
  return error instanceof Error ? error.message : 'Could not load or save the campaign.';
}
