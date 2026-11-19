import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { getMyBusiness } from '../api/businesses';
import { createCampaign, deleteCampaign, getCampaign, submitCampaign, updateCampaign } from '../api/campaigns';
import type { Business, Campaign, CampaignInput } from '../api/types';
import OnboardingLayout from '../onboarding/OnboardingLayout';
import { campaignErrorMessage, campaignStatusLabels, isDraftEditable } from './campaign-display';

const listPath = '/business/campaigns';
const inputClass = 'mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#102A43] outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#059669]/20 read-only:bg-[#F8FAFC]';
const unitsFormatter = new Intl.NumberFormat('en-BD');
const textFields = [
  { name: 'title', label: 'Campaign title', min: 1, max: 120 },
  { name: 'description', label: 'Description', min: 50, max: 5000 },
  { name: 'purpose', label: 'Funding purpose', min: 1, max: 1000 },
  { name: 'useOfFunds', label: 'Use of funds', min: 1, max: 2000 },
] as const;
const numericFields = [
  { name: 'fundingTarget', label: 'Funding target (৳)', min: 1, max: Number.MAX_SAFE_INTEGER },
  { name: 'unitPrice', label: 'Price per unit (৳)', min: 1, max: Number.MAX_SAFE_INTEGER },
  { name: 'durationDays', label: 'Duration (days)', min: 7, max: 90 },
] as const;

type DraftFields = Omit<CampaignInput, 'businessId'>;
type DraftForm = Record<keyof DraftFields, string>;

function draftValues(campaign: Campaign | null): DraftForm {
  return {
    title: campaign?.title ?? '',
    description: campaign?.description ?? '',
    purpose: campaign?.purpose ?? '',
    useOfFunds: campaign?.useOfFunds ?? '',
    fundingTarget: campaign ? String(campaign.fundingTarget) : '',
    unitPrice: campaign ? String(campaign.unitPrice) : '',
    durationDays: campaign ? String(campaign.durationDays) : '30',
  };
}

function CampaignForm({ business, initialCampaign }: { business: Business | null; initialCampaign: Campaign | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [values, setValues] = useState(() => draftValues(initialCampaign));
  const [busy, setBusy] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.created ? 'Campaign draft created.' : '');
  const canArchive = !!campaign && isDraftEditable(campaign.status);
  const canEdit = business?.verificationStatus === 'approved' &&
    (!campaign || (canArchive && campaign.businessId === business._id));
  const canSubmit = canEdit && campaign?.status === 'draft';
  const savedFields = draftValues(campaign);
  const hasChanges = (Object.keys(values) as (keyof DraftFields)[]).some(key => values[key] !== savedFields[key]);
  const target = Number(values.fundingTarget);
  const price = Number(values.unitPrice);
  const validAmounts = Number.isSafeInteger(target) && Number.isSafeInteger(price) && target > 0 && price > 0;
  const units = validAmounts ? target / price : NaN;
  const validUnits = Number.isInteger(units) && units >= 1 && units <= 100_000;

  function setField(name: keyof DraftFields, value: string) {
    setValues(previous => ({ ...previous, [name]: value }));
    setError('');
    setSuccess('');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || !business || busy) return;
    setError('');
    setSuccess('');
    const fields: DraftFields = {
      title: values.title.trim(), description: values.description.trim(), purpose: values.purpose.trim(),
      useOfFunds: values.useOfFunds.trim(), fundingTarget: target, unitPrice: price,
      durationDays: Number(values.durationDays),
    };
    if (!validUnits) {
      setError('Enter a whole-taka target and price that produce between 1 and 100,000 whole units.');
      return;
    }
    const invalidText = textFields.find(field => fields[field.name].length < field.min);
    if (invalidText) {
      setError(`${invalidText.label} must contain at least ${invalidText.min} characters.`);
      return;
    }
    setBusy(true);
    try {
      if (campaign) {
        const changes = Object.fromEntries(Object.entries(fields).filter(([key, value]) =>
          campaign[key as keyof DraftFields] !== value,
        )) as Partial<DraftFields>;
        if (Object.keys(changes).length === 0) {
          setSuccess('No changes to save.');
          return;
        }
        const saved = await updateCampaign(campaign._id, changes);
        setCampaign({ ...saved, latestReview: campaign.latestReview });
        setValues(draftValues(saved));
        setSuccess('Campaign draft saved.');
      } else {
        const saved = await createCampaign({ ...fields, businessId: business._id });
        void navigate(`${listPath}/${saved._id}`, { replace: true, state: { created: true } });
      }
    } catch (cause) {
      setError(campaignErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!campaign || !canArchive || busy) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await deleteCampaign(campaign._id);
      void navigate(listPath, { replace: true, state: { archived: true } });
    } catch (cause) {
      setConfirmArchive(false);
      setError(campaignErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!campaign || !canSubmit || hasChanges || busy || confirmArchive) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const submitted = await submitCampaign(campaign._id);
      setCampaign({ ...submitted, latestReview: campaign.latestReview });
      setSuccess('Campaign submitted for review.');
    } catch (cause) {
      setError(campaignErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#DCE5EB] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={listPath} className="text-sm font-bold text-[#047857] hover:underline">Back to My Campaigns</Link>
        <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-semibold text-[#334E68]">
          {campaign ? campaignStatusLabels[campaign.status] : 'Draft'}
        </span>
      </div>
      {campaign?.latestReview?.decision === 'rejected' && <section className="mt-5 rounded-xl border border-[#F3C7C7] bg-[#FFF5F5] p-4 text-sm text-[#7F1D1D]">
        <h2 className="font-bold">Review feedback for version {campaign.latestReview.version}</h2>
        <p className="mt-2 whitespace-pre-wrap break-words">{campaign.latestReview.feedback}</p>
      </section>}
      {!canEdit && <p className="mt-5 rounded-xl bg-[#F1F5F9] p-4 text-sm leading-6 text-[#334E68]">
        {campaign && !canArchive
          ? 'This campaign is read-only in its current status.'
          : <>Your business needs approval to {campaign ? 'edit' : 'create'} a campaign.{' '}
            <Link className="font-semibold text-[#047857] underline" to={business ? '/business/review-status' : '/business/profile'}>
              {business ? 'Check verification status' : 'Open business profile'}
            </Link>
          </>}
      </p>}
      {(canEdit || campaign) && <form onSubmit={save} className="mt-6" aria-busy={busy}>
        <fieldset disabled={busy} className="grid gap-5">
          {textFields.map(field => <label key={field.name} className="block text-sm font-semibold">
            {field.label}
            {field.name === 'title'
              ? <input className={inputClass} required readOnly={!canEdit} value={values.title} maxLength={field.max} onChange={event => setField(field.name, event.target.value)} />
              : <textarea className={inputClass} required readOnly={!canEdit} value={values[field.name]} minLength={field.min} maxLength={field.max} rows={field.name === 'description' ? 4 : 2} onChange={event => setField(field.name, event.target.value)} />}
          </label>)}
          <div className="grid gap-4 sm:grid-cols-3">
            {numericFields.map(field => <label key={field.name} className="block text-sm font-semibold">
              {field.label}
              <input className={inputClass} type="number" inputMode="numeric" required readOnly={!canEdit} value={values[field.name]} min={field.min} max={field.max} step={1} onChange={event => setField(field.name, event.target.value)} />
            </label>)}
          </div>
          <div className="rounded-xl bg-[#ECFDF5] px-4 py-3 text-sm text-[#065F46]" aria-live="polite">
            <span className="font-bold">{canEdit ? 'Unit preview' : 'Total units'}</span>
            {' · '}
            {!canEdit && campaign ? unitsFormatter.format(campaign.totalUnits) : validUnits ? unitsFormatter.format(units) : 'Enter a target and price that divide into 1–100,000 whole units.'}
          </div>
        </fieldset>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {success && <p role="status" className="mt-5 rounded-xl bg-[#ECFDF5] p-4 text-sm text-[#065F46]">{success}</p>}
        {(canEdit || canArchive) && <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E3EAF0] pt-5">
          {canEdit && <button type="submit" disabled={busy || confirmArchive} className="rounded-xl bg-[#047857] px-5 py-3 text-sm font-bold text-white hover:bg-[#065F46] disabled:opacity-60">
            {busy && !confirmArchive ? 'Saving…' : campaign ? 'Save changes' : 'Create draft'}
          </button>}
          {canArchive && !confirmArchive && <button type="button" disabled={busy} onClick={() => { setConfirmArchive(true); setSuccess(''); }} className="rounded-xl border border-[#CBD5E1] px-5 py-3 text-sm font-bold text-[#334E68] hover:bg-[#F1F5F9]">
            Archive campaign
          </button>}
          {canSubmit && !confirmArchive && <button type="button" disabled={busy || hasChanges} onClick={() => void submit()} className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            Submit for review
          </button>}
        </div>}
        {canSubmit && hasChanges && <p className="mt-3 text-sm text-[#526B82]">Save your changes before submitting.</p>}
        {confirmArchive && <div className="mt-4 rounded-xl border border-[#F3C7C7] bg-[#FFF5F5] p-4">
          <p className="text-sm text-[#7F1D1D]">Archive this campaign? It will leave My Campaigns and any review history will be kept.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={() => void archive()} className="rounded-xl bg-[#B42318] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Archiving…' : 'Confirm archive'}</button>
            <button type="button" disabled={busy} onClick={() => setConfirmArchive(false)} className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-semibold">Cancel</button>
          </div>
        </div>}
      </form>}
    </div>
  );
}

type DraftState = {
  requestKey: string;
  business: Business | null;
  campaign: Campaign | null;
  error: string;
};

export default function CampaignDraftPage() {
  const { id } = useParams();
  const [retry, setRetry] = useState(0);
  const requestKey = `${id ?? 'new'}:${retry}`;
  const [state, setState] = useState<DraftState>();
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getMyBusiness(controller.signal), id ? getCampaign(id, controller.signal) : null])
      .then(([business, campaign]) => {
        if (!controller.signal.aborted) setState({ requestKey, business, campaign, error: '' });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setState({ requestKey, business: null, campaign: null, error: campaignErrorMessage(cause) });
      });
    return () => controller.abort();
  }, [id, requestKey]);

  const result = state?.requestKey === requestKey ? state : undefined;
  return (
    <OnboardingLayout title={id ? 'Campaign details' : 'Create campaign'} description="Set the funding target and unit price for your virtual campaign." step={4}>
      {!result && <p role="status" className="rounded-3xl border border-[#DCE5EB] bg-white p-6 text-sm">Loading campaign…</p>}
      {result?.error && <div role="alert" className="rounded-3xl border border-[#F3C7C7] bg-white p-6 text-sm text-red-800">
        <p>{result.error}</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <button className="font-semibold underline" type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
          <Link to={listPath} className="font-semibold text-[#047857]">Back to My Campaigns</Link>
        </div>
      </div>}
      {result && !result.error && <CampaignForm key={requestKey} business={result.business} initialCampaign={result.campaign} />}
    </OnboardingLayout>
  );
}
