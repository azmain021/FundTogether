import { apiRequest } from './client';

export type InvestmentReceipt = {
  investment: {
    _id: string;
    campaignId: string;
    units: number;
    unitPriceAtPurchase: number;
    totalCost: number;
    createdAt: string;
    status: 'confirmed';
  };
  receiptNumber: string;
  walletBalance: number;
  campaignRemainingUnits: number;
};

export function purchaseInvestment(
  campaignId: string, units: number, idempotencyKey: string, signal?: AbortSignal,
) {
  return apiRequest<InvestmentReceipt>('/investments', {
    method: 'POST',
    body: { campaignId, units, idempotencyKey },
    signal,
  });
}
