import { apiRequest } from './client';

export type RegisterBusinessOwnerInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  acceptedTerms: boolean;
};

export type OwnerAccount = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  role: 'business_owner';
  isActive: boolean;
};

export const registerBusinessOwner = (input: RegisterBusinessOwnerInput) =>
  apiRequest<OwnerAccount & { recoveryCode: string }>('/auth/register/business-owner', {
    method: 'POST',
    body: input,
  });

export type SessionUser = Omit<OwnerAccount, 'role'> & {
  role: 'business_owner' | 'investor' | 'admin';
};

export const accountHome = {
  business_owner: '/business/profile',
  investor: '/investor',
  admin: '/admin',
} satisfies Record<SessionUser['role'], string>;

export const registerInvestor = (input: RegisterBusinessOwnerInput) =>
  apiRequest<SessionUser & { recoveryCode: string }>('/auth/register/investor', { method: 'POST', body: input });

export const createRecoveryCode = (currentPassword: string) =>
  apiRequest<{ recoveryCode: string }>('/auth/recovery-code', { method: 'POST', body: { currentPassword } });

export const resetPassword = (input: { email: string; recoveryCode: string; password: string }) =>
  apiRequest<void>('/auth/reset-password', { method: 'POST', body: input });

export const login = (input: { email: string; password: string }) =>
  apiRequest<SessionUser>('/auth/login', { method: 'POST', body: input });

export const getCurrentUser = (signal?: AbortSignal) =>
  apiRequest<SessionUser>('/auth/me', { signal });

export const logout = () =>
  apiRequest<void>('/auth/logout', { method: 'POST' });
