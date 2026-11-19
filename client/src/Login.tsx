import { useState, type FormEvent } from 'react';
import { login } from './api/auth';
import { ApiError } from './api/client';

export default function Login({ next = '' }: { next?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'mt-2 h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const user = await login({ email, password });
      // Only known application paths are accepted as return destinations.
      const allowed = ['/marketplace', '/campaigns/shobuj-bazar', '/business/profile', '/business/documents', '/business/review-status'];
      const destination = allowed.includes(next) ? next : user.role === 'business_owner' ? '/business/profile' : '/marketplace';
      window.location.assign(destination);
    } catch (cause: unknown) {
      setError(cause instanceof ApiError && cause.details.length ? cause.details.join(' ') : cause instanceof Error ? cause.message : 'Could not log in. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FB] px-5 py-12 text-[#102A43] sm:py-20">
      <main className="mx-auto max-w-md">
        <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
        <div className="mt-8 rounded-3xl border border-[#DCE5EB] bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-[#059669]">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold">Log in to your account</h1>
          <p className="mt-3 text-sm leading-6 text-[#526B82]">{next ? 'Log in to continue to this page.' : 'Use the email and password you registered with.'}</p>
          {new URLSearchParams(window.location.search).get('registered') === '1' && <p role="status" className="mt-5 rounded-xl bg-[#ECFDF5] p-4 text-sm text-[#047857]">Account created. Log in to set up your business profile.</p>}
          <form onSubmit={submit} className="mt-7 space-y-5" aria-busy={saving}>
            <fieldset disabled={saving} className="space-y-5">
              <label className="block text-sm font-semibold" htmlFor="login-email">Email address
                <input id="login-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-semibold" htmlFor="login-password">Password
                <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className={inputClass} />
              </label>
              <label className="flex items-center gap-2 text-xs text-[#526B82]"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} className="accent-[#059669]" />Show password</label>
              {error && <p role="alert" className="rounded-xl bg-[#FEF2F2] p-4 text-sm text-[#B42318]">{error}</p>}
              <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white hover:bg-[#047857] disabled:opacity-60">{saving ? 'Logging in…' : 'Log in'}</button>
            </fieldset>
          </form>
          <p className="mt-6 text-sm text-[#526B82]">New to FundTogether? <a href="/register" className="font-bold text-[#047857]">Create an account</a></p>
        </div>
        <a href="/" className="mt-6 inline-block text-sm text-[#526B82]">← Back to home</a>
      </main>
    </div>
  );
}
