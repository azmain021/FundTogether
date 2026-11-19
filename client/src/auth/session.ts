import { createContext, useContext } from 'react';
import type { SessionUser } from '../api/auth';

export type SessionState = {
  user: SessionUser | null;
  loading: boolean;
  error: string;
  retry: () => void;
};

export const SessionContext = createContext<SessionState | null>(null);

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('SessionProvider is required');
  return value;
}
