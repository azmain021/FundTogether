import { useEffect, useState } from 'react';
import { getWalletLedger } from '../api/wallet';
import type { WalletLedger } from '../api/wallet';
import AccountLinks from '../auth/AccountLinks';
import { formatTaka } from './format-taka';

const dateFormat = new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' });
const pageButton = 'rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 font-semibold text-[#047857] disabled:opacity-50';

function LedgerEntries({ page, onPageChange }: { page: number; onPageChange: (page: number) => void }) {
  const [ledger, setLedger] = useState<WalletLedger>();
  const [error, setError] = useState('');

  useEffect(() => {
    const request = new AbortController();
    getWalletLedger(page, request.signal).then(setLedger).catch((error: unknown) => {
      if (!request.signal.aborted) {
        setError(error instanceof Error ? error.message : 'Could not load the wallet ledger.');
      }
    });
    return () => request.abort();
  }, [page]);

  return (
    <>
      {error && <p role="alert" className="mt-6 text-sm text-red-700">{error}</p>}
      {!error && !ledger && <p role="status" className="mt-6 text-sm text-[#526B82]">Loading ledger…</p>}
      {ledger?.transactions.length === 0 && <p className="mt-6 text-sm text-[#526B82]">No transactions on this page.</p>}
      {ledger && ledger.transactions.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#DCE5EB] bg-white">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-[#F1F5F9] text-[#334E68]">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Transaction</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                <th scope="col" className="px-4 py-3 text-right">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {ledger.transactions.map((entry) => {
                const credit = entry.type === 'starter_credit';
                return (
                  <tr key={entry._id} className="border-t border-[#DCE5EB]">
                    <td className="px-4 py-3">{dateFormat.format(new Date(entry.createdAt))}</td>
                    <td className="px-4 py-3">{credit ? 'Starter credit' : 'Investment debit'}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${credit ? 'text-[#047857]' : 'text-[#334E68]'}`}>
                      {credit ? '+' : '−'}{formatTaka(entry.amount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatTaka(entry.balanceAfter)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {(page > 1 || ledger?.hasNext) && (
        <nav aria-label="Ledger pages" className="mt-6 flex items-center justify-between gap-4 text-sm">
          <button className={pageButton} disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
          <span>Page {page}</span>
          <button className={pageButton} disabled={!ledger?.hasNext} onClick={() => onPageChange(page + 1)}>Next</button>
        </nav>
      )}
    </>
  );
}

export default function WalletLedgerPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#DCE5EB] bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
          <AccountLinks />
        </div>
      </header>
      <main className="page-container py-12">
        <a href="/investor" className="text-sm font-semibold text-[#047857]">Back to investor account</a>
        <h1 className="mt-3 text-3xl font-bold">Wallet ledger</h1>
        <p className="mt-2 text-sm text-[#526B82]">Transaction history for your virtual wallet.</p>
        <LedgerEntries key={page} page={page} onPageChange={setPage} />
      </main>
    </div>
  );
}
