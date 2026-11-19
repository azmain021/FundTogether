import { useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, type SessionUser } from '../api/auth';
import { ApiError } from '../api/client';
import { SessionContext } from './session';

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ user: SessionUser | null; loading: boolean; error: string }>({
    user: null, loading: true, error: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser(controller.signal).then(user => {
      if (!controller.signal.aborted) setState({ user, loading: false, error: '' });
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return;
      setState({
        user: null,
        loading: false,
        error: cause instanceof ApiError && cause.status === 401 ? '' : 'Could not check your session. Please try again.',
      });
    });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ user: null, loading: true, error: '' });
    setAttempt(value => value + 1);
  }

  return <SessionContext.Provider value={{ ...state, retry }}>{children}</SessionContext.Provider>;
}
