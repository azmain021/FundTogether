import { useState, type FormEvent } from 'react';
import { accountHome, createRecoveryCode } from '../api/auth';
import RecoveryCodeNotice from './RecoveryCodeNotice';
import { useSession } from './session';

export default function AccountSecurity() {
  const { user } = useSession();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working) return;
    setError('');
    setWorking(true);
    try {
      const result = await createRecoveryCode(password);
      setPassword('');
      setCode(result.recoveryCode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not generate a recovery code.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FB] px-5 py-12 text-[#102A43] sm:py-20">
      <main className="mx-auto max-w-md">
        <a href={user ? accountHome[user.role] : '/'} className="text-sm font-bold text-[#047857]">Back to your account</a>
        <div className="mt-6 rounded-3xl border border-[#DCE5EB] bg-white p-7 shadow-sm sm:p-9">
          <h1 className="text-3xl font-bold">Account security</h1>
          {code ? <RecoveryCodeNotice code={code} /> : (
            <form onSubmit={submit} className="mt-5 space-y-5" aria-busy={working}>
              <p className="text-sm leading-6 text-[#526B82]">Generate a recovery code to reset your password. A new code replaces your previous one.</p>
              <label className="block text-sm font-semibold">
                Current password
                <input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)} disabled={working} className="mt-2 h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10" />
              </label>
              {error && <p role="alert" className="rounded-xl bg-[#FEF2F2] p-4 text-sm text-[#B42318]">{error}</p>}
              <button type="submit" disabled={working} className="w-full rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white hover:bg-[#047857] disabled:opacity-60">
                {working ? 'Generating…' : 'Generate recovery code'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
