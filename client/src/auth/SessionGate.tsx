import { useEffect, type ReactNode } from 'react';
import type { SessionUser } from '../api/auth';
import { useSession } from './session';

export default function SessionGate({ children, roles }: { children: ReactNode; roles?: SessionUser['role'][] }) {
  const { user, loading, error, retry } = useSession();
  const next = `${window.location.pathname}${window.location.search}`;

  useEffect(() => {
    if (!loading && !error && !user) {
      window.location.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, loading, error, next]);

  if (loading || (!user && !error)) {
    return <div role="status" className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm text-[#526B82]">Checking your session…</div>;
  }
  if (error) {
    return <div className="grid min-h-screen place-items-center bg-[#F6F9FB] p-6"><div role="alert" className="max-w-md rounded-2xl bg-white p-8 text-center"><p>{error}</p><button onClick={retry} className="mt-5 rounded-xl bg-[#059669] px-5 py-3 font-bold text-white">Try again</button><a href="/" className="mt-4 block text-sm text-[#526B82]">Back to home</a></div></div>;
  }
  if (roles && (!user || !roles.includes(user.role))) {
    const title = roles.length === 1 && roles[0] === 'business_owner'
      ? 'Business owner account required' : 'This page is unavailable for your account';
    return <div className="grid min-h-screen place-items-center bg-[#F6F9FB] p-6"><div className="rounded-2xl bg-white p-8 text-center"><h1 className="text-xl font-bold">{title}</h1><a href="/marketplace" className="mt-5 block text-[#047857]">Back to marketplace</a></div></div>;
  }
  return children;
}
