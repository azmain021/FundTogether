import { apiRequest } from './client';

export type WalletTransaction = {
  _id: string;
  type: 'starter_credit' | 'investment_debit';
  amount: number;
  balanceAfter: number;
  createdAt: string;
  investmentId?: string;
};

export type WalletSummary = {
  balance: number;
  transactions: WalletTransaction[];
};

export type WalletLedger = {
  page: number;
  pageSize: number;
  hasNext: boolean;
  transactions: WalletTransaction[];
};

export function getWallet(signal?: AbortSignal) {
  return apiRequest<WalletSummary>('/wallet/me', { signal });
}

export function getWalletLedger(page: number, signal?: AbortSignal) {
  return apiRequest<WalletLedger>(`/wallet/me/ledger?page=${page}`, { signal });
}
