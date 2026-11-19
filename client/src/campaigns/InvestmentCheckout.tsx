import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../api/client';
import { purchaseInvestment } from '../api/investments';
import type { InvestmentReceipt } from '../api/investments';
import type { PublishedCampaignDetail } from '../api/types';
import { getWallet } from '../api/wallet';
import { formatTaka } from '../wallet/format-taka';

type Attempt = { units: number; idempotencyKey: string };
const primary = 'rounded-xl bg-[#047857] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#065F46] disabled:opacity-50';

function savedAttempt(key: string): Attempt | undefined {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? 'null') as Attempt | null;
    if (value && Number.isInteger(value.units) && value.units >= 1 && value.units <= 10_000 &&
        typeof value.idempotencyKey === 'string') return value;
  } catch {
    // Checkout can still retry in memory when session storage is unavailable.
  }
}

function persistAttempt(key: string, attempt?: Attempt) {
  try {
    if (attempt) sessionStorage.setItem(key, JSON.stringify(attempt));
    else sessionStorage.removeItem(key);
  } catch {
    // Checkout can still retry in memory when session storage is unavailable.
  }
}

export default function InvestmentCheckout({ campaign, investorId, onRefresh }: {
  campaign: PublishedCampaignDetail;
  investorId: string;
  onRefresh: () => Promise<void>;
}) {
  const storageKey = `investment:${investorId}:${campaign._id}`;
  const [pending, setPending] = useState(() => savedAttempt(storageKey));
  const [walletBalance, setWalletBalance] = useState<number>();
  const [walletError, setWalletError] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [review, setReview] = useState<Attempt>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState(false);
  const [receipt, setReceipt] = useState<InvestmentReceipt>();
  const dialog = useRef<HTMLDialogElement>(null);
  const canBuy = campaign.acceptingInvestments;

  useEffect(() => {
    if (!canBuy) return;
    const request = new AbortController();
    getWallet(request.signal).then(({ balance }) => {
      setWalletBalance(balance);
      setWalletError(false);
    }).catch(() => {
      if (!request.signal.aborted) setWalletError(true);
    });
    return () => request.abort();
  }, [canBuy]);

  useEffect(() => {
    if (review && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [review]);

  const units = Number(quantity);
  const maxUnits = Math.min(campaign.remainingUnits, 10_000);
  const validQuantity = Number.isInteger(units) && units >= 1 && units <= maxUnits;
  const cost = units * campaign.unitPrice;
  const canReview = canBuy && validQuantity && Number.isSafeInteger(cost) &&
    walletBalance !== undefined && cost <= walletBalance;

  function openReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending && !canReview) return;
    setError('');
    setReview(pending ?? { units, idempotencyKey: crypto.randomUUID() });
  }

  function closeReview() {
    dialog.current?.close();
    setReview(undefined);
  }

  async function refresh() {
    const [wallet, updatedCampaign] = await Promise.allSettled([getWallet(), onRefresh()]);
    if (wallet.status === 'fulfilled') {
      setWalletBalance(wallet.value.balance);
      setWalletError(false);
    }
    setRefreshError(wallet.status === 'rejected' || updatedCampaign.status === 'rejected');
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!review || saving) return;
    setSaving(true);
    setError('');
    persistAttempt(storageKey, review);
    try {
      const purchase = await purchaseInvestment(
        campaign._id, review.units, review.idempotencyKey, AbortSignal.timeout(15_000),
      );
      persistAttempt(storageKey);
      setPending(undefined);
      setReceipt(purchase);
      closeReview();
      await refresh();
    } catch (error: unknown) {
      const uncertain = !(error instanceof ApiError) || error.status === 0 || error.status >= 500 ||
        [401, 403, 408, 429].includes(error.status);
      if (uncertain) {
        setPending(review);
        setError('We could not confirm the result. Retry this purchase to check its status.');
      } else {
        persistAttempt(storageKey);
        setPending(undefined);
        setError(error instanceof Error ? error.message : 'Could not complete the purchase.');
        await refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-[#DCE5EB] bg-white p-6">
      <h2 className="text-xl font-bold">Buy virtual units</h2>
      <p className="mt-1 text-sm text-[#526B82]">Simulated purchase using your virtual wallet.</p>
      {walletBalance !== undefined && (
        <p className="mt-4 text-sm font-semibold" data-testid="checkout-wallet-balance">Available balance {formatTaka(walletBalance)}</p>
      )}
      {walletError && <p role="alert" className="mt-4 text-sm text-red-700">Could not load your wallet. <button type="button" className="underline" onClick={() => void refresh()}>Try again</button></p>}
      {refreshError && <p role="status" className="mt-4 text-sm text-[#526B82]">Some figures could not be refreshed. <button type="button" className="underline" onClick={() => void refresh()}>Refresh figures</button></p>}
      {(canBuy || pending) ? (
        <form onSubmit={openReview} className="mt-5 space-y-3">
          {pending ? (
            <p className="text-sm text-[#526B82]">Check the result of your previous request for {pending.units} virtual units.</p>
          ) : (
            <>
              <label htmlFor="investment-units" className="block text-sm font-semibold">Units</label>
              <input id="investment-units" type="number" min={1} max={maxUnits} step={1} required
                className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2"
                value={quantity} onChange={event => setQuantity(event.target.value)} />
              {validQuantity && <p className="text-sm text-[#526B82]">Estimated total {formatTaka(cost)}</p>}
              {validQuantity && walletBalance !== undefined && cost > walletBalance && (
                <p className="text-sm text-red-700">Your virtual wallet has insufficient funds.</p>
              )}
            </>
          )}
          <button className={primary} disabled={saving || (!pending && !canReview)}>
            {pending ? 'Review previous purchase' : 'Review purchase'}
          </button>
        </form>
      ) : <p className="mt-5 text-sm text-[#526B82]">This campaign is closed to purchases.</p>}
      {receipt && (
        <section aria-labelledby="purchase-confirmed" className="mt-6 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
          <h3 id="purchase-confirmed" className="font-bold text-[#065F46]">Purchase confirmed</h3>
          <dl className="mt-2 space-y-2 break-words text-sm">
            <div><dt>Receipt number</dt><dd className="font-semibold">{receipt.receiptNumber}</dd></div>
            <div><dt>{receipt.investment.units} virtual units</dt><dd className="font-semibold">{formatTaka(receipt.investment.totalCost)}</dd></div>
            <div><dt>Balance after purchase</dt><dd className="font-semibold">{formatTaka(receipt.walletBalance)}</dd></div>
          </dl>
          <Link to="/investor/wallet" className="mt-3 inline-block text-sm font-semibold text-[#047857]">View wallet ledger</Link>
        </section>
      )}
      <dialog ref={dialog} aria-labelledby="purchase-review-title"
        onCancel={event => { event.preventDefault(); if (!saving) closeReview(); }}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-[#DCE5EB] bg-white p-6 text-[#102A43] shadow-xl backdrop:bg-[#102A43]/50">
        {review && (
          <form onSubmit={confirm}>
            <h2 id="purchase-review-title" className="text-xl font-bold">{pending ? 'Check your purchase' : 'Confirm purchase'}</h2>
            <p className="mt-2 text-sm text-[#526B82]">{campaign.title}</p>
            <dl className="my-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt>Units</dt><dd>{review.units}</dd></div>
              <div className="flex justify-between gap-4"><dt>Price per unit</dt><dd>{formatTaka(campaign.unitPrice)}</dd></div>
              <div className="flex justify-between gap-4 font-bold"><dt>Total</dt><dd>{formatTaka(review.units * campaign.unitPrice)}</dd></div>
              {!pending && walletBalance !== undefined && (
                <div className="flex justify-between gap-4"><dt>Projected balance</dt><dd>{formatTaka(walletBalance - review.units * campaign.unitPrice)}</dd></div>
              )}
            </dl>
            {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" disabled={saving} onClick={closeReview} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Close</button>
              <button className={primary} disabled={saving}>{saving ? 'Submitting…' : pending ? 'Retry purchase' : 'Confirm purchase'}</button>
            </div>
          </form>
        )}
      </dialog>
    </aside>
  );
}
