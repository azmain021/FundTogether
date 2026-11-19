import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { getMyBusiness } from '../api/businesses';
import { listMyCampaigns } from '../api/campaigns';
import type { Business, Campaign, CampaignStatus } from '../api/types';
import OnboardingLayout from '../onboarding/OnboardingLayout';
import { campaignErrorMessage, campaignStatusLabels, isDraftEditable } from './campaign-display';

const money = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 });

type ListState = {
  requestKey: string;
  campaigns: Campaign[];
  business: Business | null;
  error: string;
};

export default function CampaignList() {
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const selected = search.get('status');
  const status = selected && Object.hasOwn(campaignStatusLabels, selected) ? selected as CampaignStatus : undefined;
  const [retry, setRetry] = useState(0);
  const requestKey = `${status ?? ''}:${retry}`;
  const [state, setState] = useState<ListState>();

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getMyBusiness(controller.signal), listMyCampaigns(status, controller.signal)])
      .then(([business, campaigns]) => {
        if (!controller.signal.aborted) setState({ requestKey, business, campaigns, error: '' });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ requestKey, business: null, campaigns: [], error: campaignErrorMessage(error) });
      });
    return () => controller.abort();
  }, [requestKey, status]);

  const result = state?.requestKey === requestKey ? state : undefined;
  const approved = result?.business?.verificationStatus === 'approved';

  return (
    <OnboardingLayout title="My Campaigns" description="Manage funding drafts for your business." step={4}>
      <div className="rounded-3xl border border-[#DCE5EB] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="text-sm font-semibold">
            Status
            <select
              value={status ?? ''}
              onChange={event => setSearch(event.target.value ? { status: event.target.value } : {})}
              className="mt-2 block min-h-11 min-w-44 rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm"
            >
              <option value="">All statuses</option>
              {Object.entries(campaignStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          {approved && <Link to="/business/campaigns/new" className="rounded-xl bg-[#047857] px-4 py-3 text-sm font-bold text-white hover:bg-[#065F46]">Create campaign</Link>}
        </div>
        {!result && <p role="status" className="mt-6 text-sm text-[#526B82]">Loading campaigns…</p>}
        {location.state?.archived && <p role="status" className="mt-6 rounded-xl bg-[#ECFDF5] p-4 text-sm text-[#065F46]">Campaign archived.</p>}
        {result?.error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {result.error} <button type="button" className="ml-2 font-semibold underline" onClick={() => setRetry(attempt => attempt + 1)}>Try again</button>
        </div>}
        {result && !result.error && <>
          {!approved && <p className="mt-6 rounded-xl bg-[#F1F5F9] p-4 text-sm leading-6 text-[#334E68]">
            {result.business ? 'Your business needs approval before you can create a campaign.' : 'Set up your business profile before creating a campaign.'}
            {' '}<Link to={result.business ? '/business/review-status' : '/business/profile'} className="font-bold text-[#047857] underline">
              {result.business ? 'Check verification status' : 'Open business profile'}
            </Link>
          </p>}
          {result.campaigns.length === 0 && <p className="mt-6 border-t border-[#E3EAF0] pt-6 text-sm text-[#526B82]">
            {status ? 'No campaigns have this status.' : 'You have no campaigns yet.'}
          </p>}
          <ul className="mt-6 divide-y divide-[#E3EAF0]">
            {result.campaigns.map(campaign => (
              <li key={campaign._id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold">{campaign.title}</h2>
                  <p className="mt-1 text-sm text-[#526B82]">
                    {money.format(campaign.fundingTarget)} · {campaign.totalUnits.toLocaleString('en-BD')} units · {campaign.durationDays} days
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-semibold text-[#334E68]">
                  {campaignStatusLabels[campaign.status]}
                </span>
                <Link to={`/business/campaigns/${campaign._id}`} aria-label={`Open ${campaign.title}`} className="w-fit rounded-xl border border-[#CBD5E1] px-4 py-2 text-sm font-bold text-[#047857] hover:bg-[#F1F5F9]">
                  {approved && result.business?._id === campaign.businessId && isDraftEditable(campaign.status) ? 'View or edit' : 'View'}
                </Link>
              </li>
            ))}
          </ul>
        </>}
      </div>
    </OnboardingLayout>
  );
}
