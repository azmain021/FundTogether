import { useState } from 'react';
import { accountHome, logout } from '../api/auth';
import { useSession } from './session';

export default function AccountLinks({ mobile = false }: { mobile?: boolean }) {
  const { user, loading } = useSession();
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    if (leaving) return;
    setLeaving(true);
    setError('');
    try {
      await logout();
      window.location.assign('/');
    } catch {
      setError('Could not log out. Please try again.');
      setLeaving(false);
    }
  }

  if (loading) return <span className="text-xs text-[#627D98]">Loading account…</span>;
  return (
    <div className={`flex gap-4 ${mobile ? 'flex-col items-start px-3 py-3' : 'items-center'}`}>
      {user ? <>
        <a href={accountHome[user.role]} className="text-sm font-semibold text-[#047857]">{user.role === 'business_owner' ? 'Business Profile' : user.displayName}</a>
        <a href="/account/security" className="text-sm font-semibold text-[#334E68]">Security</a>
        <button onClick={signOut} disabled={leaving} className="text-sm font-semibold text-[#334E68] disabled:opacity-60">{leaving ? 'Logging out…' : 'Log out'}</button>
        {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
      </> : <>
        <a href="/login" className="text-sm font-semibold text-[#334E68] hover:text-[#059669]">Log in</a>
        <a href="/register" className="rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white hover:bg-[#047857]">Create Account</a>
      </>}
    </div>
  );
}
