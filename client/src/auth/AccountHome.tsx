import { useEffect, useState } from 'react';
import { getWallet } from '../api/wallet';
import { formatTaka } from '../wallet/format-taka';
import AccountLinks from './AccountLinks';
import { useSession } from './session';

export default function AccountHome({ role }: { role: 'admin' | 'investor' }) {
  const { user } = useSession();
  const [balance, setBalance] = useState<number>();
  const [walletError, setWalletError] = useState(false);

  useEffect(() => {
    if (role !== 'investor') return;
    const request = new AbortController();
    getWallet(request.signal).then((wallet) => setBalance(wallet.balance)).catch(() => {
      if (!request.signal.aborted) setWalletError(true);
    });
    return () => request.abort();
  }, [role]);

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#DCE5EB] bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
          <div className="flex flex-wrap items-center gap-4">
            {role === 'investor' && balance !== undefined && (
              <a href="/investor/wallet" className="rounded-lg bg-[#ECFDF5] px-3 py-2 text-sm font-semibold text-[#047857]">
                Virtual balance {formatTaka(balance)}
              </a>
            )}
            <AccountLinks />
          </div>
        </div>
      </header>
      <main className="page-container py-12">
        <h1 className="text-3xl font-bold">{role === 'admin' ? 'Administrator account' : 'Investor account'}</h1>
        <p className="mt-3 text-sm text-[#526B82]">Signed in as {user?.displayName} ({user?.email}).</p>
        {role === 'investor' && (
          <section className="mt-6 max-w-md rounded-xl border border-[#DCE5EB] bg-white p-5" aria-labelledby="wallet-heading">
            <h2 id="wallet-heading" className="text-sm font-semibold text-[#334E68]">Virtual wallet balance</h2>
            {walletError ? (
              <p role="alert" className="mt-2 text-sm text-red-700">Could not load your balance.</p>
            ) : balance === undefined ? (
              <p role="status" className="mt-2 text-sm text-[#526B82]">Loading balance…</p>
            ) : (
              <p className="mt-2 text-3xl font-bold tabular-nums">{formatTaka(balance)}</p>
            )}
            <a href="/investor/wallet" className="mt-4 inline-block text-sm font-semibold text-[#047857]">View wallet ledger</a>
          </section>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {role === 'admin' && <a href="/admin/campaigns" className="rounded-xl bg-[#047857] px-5 py-3 text-sm font-bold text-white hover:bg-[#065F46]">Campaign review</a>}
          <a href="/marketplace" className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-sm font-bold text-[#047857]">Browse campaigns</a>
        </div>
      </main>
    </div>
  );
}
