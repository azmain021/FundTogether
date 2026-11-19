import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { decideCampaign, getCampaign, getCampaignReviewQueue } from '../api/campaigns';
import type { Campaign, CampaignQueueItem } from '../api/types';
import AccountLinks from '../auth/AccountLinks';
import { campaignErrorMessage, campaignStatusLabels } from './campaign-display';

const queuePath = '/admin/campaigns';
const money = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dhaka' });

function DecisionForm({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [feedback, setFeedback] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const canApprove = campaign.businessVerificationStatus === 'approved';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working) return;
    setError('');
    const message = feedback.trim();
    if (decision === 'rejected' && !message) {
      setError('Enter feedback for the owner before rejecting.');
      return;
    }
    setWorking(true);
    try {
      await decideCampaign(campaign._id, { decision, version: campaign.version, feedback: message || undefined });
      void navigate(queuePath, { replace: true, state: { decisionMessage: decision === 'approved' ? 'Campaign published.' : 'Campaign rejected.' } });
    } catch (cause) {
      setError(campaignErrorMessage(cause));
    } finally {
      setWorking(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 border-t border-[#E3EAF0] pt-6" aria-busy={working}>
      {!canApprove && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Publication requires the linked business to be approved.</p>}
      <label className="block text-sm font-semibold">
        Decision
        <select value={decision} onChange={event => { setDecision(event.target.value === 'rejected' ? 'rejected' : 'approved'); setError(''); }} disabled={working} className="mt-2 block rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5">
          <option value="approved">Approve and publish</option>
          <option value="rejected">Reject</option>
        </select>
      </label>
      <label className="block text-sm font-semibold">
        {decision === 'rejected' ? 'Feedback (required)' : 'Feedback (optional)'}
        <textarea rows={4} maxLength={2000} required={decision === 'rejected'} value={feedback} onChange={event => setFeedback(event.target.value)} disabled={working} className="mt-2 block w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5" />
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={working || (decision === 'approved' && !canApprove)} className="rounded-xl bg-[#047857] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {working ? 'Saving decision…' : decision === 'approved' ? 'Publish campaign' : 'Reject campaign'}
      </button>
    </form>
  );
}

function ReviewDetails({ campaign }: { campaign: Campaign }) {
  const snapshot = campaign.submittedSnapshot;
  const source = snapshot ?? campaign;
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={queuePath} className="text-sm font-bold text-[#047857]">Back to review queue</Link>
          <h2 className="mt-3 break-words text-2xl font-bold">{source.title}</h2>
          <p className="mt-2 text-sm text-[#526B82]">Version {campaign.version}{campaign.submittedAt && ` · Submitted ${dateTime.format(new Date(campaign.submittedAt))}`}</p>
        </div>
        <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-bold">{campaignStatusLabels[campaign.status]}</span>
      </div>
      <dl className="mt-6 grid gap-4 rounded-xl bg-[#F1F5F9] p-4 sm:grid-cols-4">
        <div><dt className="text-xs text-[#526B82]">Funding target</dt><dd className="mt-1 font-bold">{money.format(source.fundingTarget)}</dd></div>
        <div><dt className="text-xs text-[#526B82]">Price per unit</dt><dd className="mt-1 font-bold">{money.format(source.unitPrice)}</dd></div>
        <div><dt className="text-xs text-[#526B82]">Total units</dt><dd className="mt-1 font-bold">{source.totalUnits.toLocaleString('en-BD')}</dd></div>
        <div><dt className="text-xs text-[#526B82]">Duration</dt><dd className="mt-1 font-bold">{source.durationDays} days</dd></div>
      </dl>
      <dl className="mt-6 space-y-4 break-words text-sm leading-6">
        <div><dt className="font-bold">Description</dt><dd className="whitespace-pre-wrap text-[#526B82]">{source.description}</dd></div>
        <div><dt className="font-bold">Funding purpose</dt><dd className="whitespace-pre-wrap text-[#526B82]">{source.purpose}</dd></div>
        <div><dt className="font-bold">Use of funds</dt><dd className="whitespace-pre-wrap text-[#526B82]">{source.useOfFunds}</dd></div>
        {campaign.businessVerificationStatus && <div><dt className="font-bold">Business verification</dt><dd className="capitalize text-[#526B82]">{campaign.businessVerificationStatus.replaceAll('_', ' ')}</dd></div>}
        {campaign.latestReview && <div>
          <dt className="font-bold">Latest decision · Version {campaign.latestReview.version}</dt>
          <dd className="whitespace-pre-wrap break-words text-[#526B82]">{campaign.latestReview.feedback || campaign.latestReview.decision}</dd>
        </div>}
      </dl>
      {campaign.status === 'pending_review' && (snapshot
        ? <DecisionForm campaign={campaign} />
        : <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">This campaign has no saved submission for review.</p>)}
    </>
  );
}

type Result = { key: string; queue?: CampaignQueueItem[]; campaign?: Campaign; error?: string };

export default function AdminCampaignReview() {
  const { id } = useParams();
  const location = useLocation();
  const [retry, setRetry] = useState(0);
  const key = `${id ?? 'queue'}:${retry}`;
  const [result, setResult] = useState<Result>();

  useEffect(() => {
    const controller = new AbortController();
    const request = id
      ? getCampaign(id, controller.signal).then(campaign => ({ key, campaign }))
      : getCampaignReviewQueue(controller.signal).then(queue => ({ key, queue }));
    request.then(data => {
      if (!controller.signal.aborted) setResult(data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setResult({ key, error: campaignErrorMessage(cause) });
    });
    return () => controller.abort();
  }, [id, key]);

  const current = result?.key === key ? result : undefined;
  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#DCE5EB] bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <Link to="/admin" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></Link>
          <AccountLinks />
        </div>
      </header>
      <main className="page-container py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight">{id ? 'Review campaign' : 'Campaign review queue'}</h1>
        <section className="mt-6 rounded-3xl border border-[#DCE5EB] bg-white p-5 sm:p-7">
          {!id && location.state?.decisionMessage && <p role="status" className="mb-5 rounded-xl bg-[#ECFDF5] p-4 text-sm text-[#065F46]">{location.state.decisionMessage}</p>}
          {!current && <p role="status" className="text-sm text-[#526B82]">Loading campaign review…</p>}
          {current?.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
            {current.error}{' '}<button type="button" onClick={() => setRetry(value => value + 1)} className="font-bold underline">Try again</button>
          </p>}
          {current?.campaign && <ReviewDetails key={key} campaign={current.campaign} />}
          {current?.queue && (current.queue.length > 0 ? (
            <ul className="divide-y divide-[#E3EAF0]">
              {current.queue.map(campaign => (
                <li key={campaign._id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <h2 className="break-words font-bold">{campaign.title}</h2>
                    <p className="mt-1 text-sm text-[#526B82]">
                      {campaign.businessId?.officialName ?? 'Business unavailable'} · Version {campaign.version}
                      {campaign.submittedAt && ` · ${dateTime.format(new Date(campaign.submittedAt))}`}
                    </p>
                  </div>
                  <Link to={`${queuePath}/${campaign._id}`} aria-label={`Review ${campaign.title}`} className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm font-bold text-[#047857]">Review</Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-[#526B82]">No campaigns are waiting for review.</p>)}
        </section>
      </main>
    </div>
  );
}
