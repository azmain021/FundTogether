import { useState, type FormEvent } from 'react';
import { resetPassword } from './api/auth';
import { ApiError } from './api/client';

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10';

export default function PasswordRecovery() {
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working) return;
    setError('');
    if (password !== confirmation) {
      setError('Your passwords do not match.');
      return;
    }
    setWorking(true);
    try {
      await resetPassword({ email, recoveryCode, password });
      window.location.replace('/login?reset=1');
    } catch (cause) {
      setError(cause instanceof ApiError && cause.details.length
        ? cause.details.join(' ')
        : cause instanceof Error ? cause.message : 'Could not reset your password. Please try again.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FB] px-5 py-12 text-[#102A43] sm:py-20">
      <main className="mx-auto max-w-md">
        <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
        <div className="mt-8 rounded-3xl border border-[#DCE5EB] bg-white p-7 shadow-sm sm:p-9">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-[#526B82]">Enter the email address on your account and the recovery code you saved.</p>
          <form onSubmit={submit} className="mt-7" aria-busy={working}>
            <fieldset disabled={working} className="space-y-5">
              <label className="block text-sm font-semibold">
                Email address
                <input type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                Recovery code
                <input type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={64} required value={recoveryCode} onChange={event => setRecoveryCode(event.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                New password
                <input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-semibold">
                Confirm new password
                <input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmation} onChange={event => setConfirmation(event.target.value)} className={inputClass} />
              </label>
              {error && <p role="alert" className="rounded-xl bg-[#FEF2F2] p-4 text-sm text-[#B42318]">{error}</p>}
              <button type="submit" className="w-full rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white hover:bg-[#047857] disabled:opacity-60">
                {working ? 'Updating…' : 'Update password'}
              </button>
            </fieldset>
          </form>
          <a href="/login" className="mt-6 inline-block text-sm font-bold text-[#047857]">Back to login</a>
        </div>
      </main>
    </div>
  );
}
