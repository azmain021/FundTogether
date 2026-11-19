import { useCallback, useEffect, useState } from 'react';
import { getMyBusiness } from '../api/businesses';
import { getRegistrationStatus, type RegistrationStatus } from '../api/onboarding';

export function useRegistration() {
  const [data, setData] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const business = await getMyBusiness(signal);
      const status = business ? await getRegistrationStatus(business._id, signal) : null;
      if (!signal?.aborted) setData(status);
    } catch (cause: unknown) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : 'Could not load your registration');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void reload(controller.signal);
    return () => controller.abort();
  }, [reload]);
  return { data, loading, error, reload };
}
