import { useCallback, useEffect, useState } from 'react';
import { getMyBusiness } from '../api/businesses';
import { getRegistrationStatus, type RegistrationStatus } from '../api/onboarding';

async function fetchRegistration(signal?: AbortSignal) {
  const business = await getMyBusiness(signal);
  return business ? getRegistrationStatus(business._id, signal) : null;
}

export function useRegistration() {
  const [data, setData] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback((signal?: AbortSignal) =>
    fetchRegistration(signal).then(status => {
      if (!signal?.aborted) setData(status);
    }).catch((cause: unknown) => {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : 'Could not load your registration');
    }).finally(() => {
      if (!signal?.aborted) setLoading(false);
    }), []);
  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return load();
  }, [load]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  return { data, loading, error, reload };
}
