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
  apiRequest<OwnerAccount>('/auth/register/business-owner', {
    method: 'POST',
    body: input,
  });

export type SessionUser = Omit<OwnerAccount, 'role'> & {
  role: 'business_owner' | 'investor' | 'admin';
};

export const login = (input: { email: string; password: string }) =>
  apiRequest<SessionUser>('/auth/login', { method: 'POST', body: input });

export const getCurrentUser = (signal?: AbortSignal) =>
  apiRequest<SessionUser>('/auth/me', { signal });

export const logout = () =>
  apiRequest<void>('/auth/logout', { method: 'POST' });
