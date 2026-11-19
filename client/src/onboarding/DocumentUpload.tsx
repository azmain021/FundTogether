import { useRef, useState, type FormEvent } from 'react';
import { documentDownloadUrl, removeDocument, submitBusinessApplication, uploadDocument, type DocumentType } from '../api/onboarding';
import OnboardingLayout from './OnboardingLayout';
import { DOCUMENT_OPTIONS, documentLabel, statusLabel } from './document-options';
import { useRegistration } from './use-registration';

export default function DocumentUpload() {
  const { data, loading, error, reload } = useRegistration();
  const [busy, setBusy] = useState('');
  const working = useRef(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const locked = !!data && !['draft', 'rejected', 'changes_requested'].includes(data.business.verificationStatus);
  const current = data?.documents.filter(document => document.isCurrent) ?? [];

  async function upload(type: DocumentType, files: FileList | File[] | null, replaces?: string) {
    if (!data || !files?.length || working.current || locked) return;
    working.current = true;
    setFeedback(null);
    setConfirmed(false);
    try {
      for (const file of Array.from(files)) {
        if (file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error('Choose a non-empty file that is 5 MB or smaller.');
        if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) throw new Error('Choose PDF, JPEG or PNG files only.');
        setBusy(`Uploading ${file.name}`);
        setProgress(0);
        await uploadDocument(data.business._id, type, file, setProgress, replaces);
      }
      setFeedback({ error: false, text: 'Document uploaded and saved. You can safely refresh this page.' });
    } catch (cause: unknown) {
      setFeedback({ error: true, text: cause instanceof Error ? cause.message : 'Could not upload the document' });
    } finally {
      await reload();
      setBusy('');
      working.current = false;
    }
  }

  async function remove(id: string) {
    if (working.current || locked) return;
    working.current = true;
    setBusy('Removing document');
    setFeedback(null);
    setConfirmed(false);
    try {
      await removeDocument(id);
      await reload();
      setFeedback({ error: false, text: 'Document removed from this application.' });
    } catch (cause: unknown) {
      setFeedback({ error: true, text: cause instanceof Error ? cause.message : 'Could not remove the document' });
    } finally { setBusy(''); working.current = false; }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || working.current || locked) return;
    if (!confirmed) { setFeedback({ error: true, text: 'Confirm that the uploaded documents are accurate.' }); return; }
    working.current = true;
    setBusy('Submitting your application');
    setFeedback(null);
    try {
      await submitBusinessApplication(data.business._id);
      window.location.assign('/business/review-status');
    } catch (cause: unknown) {
      setFeedback({ error: true, text: cause instanceof Error ? cause.message : 'Could not submit the application' });
      await reload();
    } finally { setBusy(''); working.current = false; }
  }

  return (
    <OnboardingLayout title="Verify Your Business" description="Upload the supporting documents for your business, then submit the complete application for review. Use synthetic documents for course demonstrations." step={3}>
      {loading && !data && <p role="status" className="rounded-2xl bg-white p-8">Loading your saved documents…</p>}
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}<button onClick={() => void reload()} className="ml-3 underline">Try again</button></div>}
      {!loading && !error && !data && <div className="rounded-2xl bg-white p-8"><h2 className="text-xl font-bold">Save your business profile first</h2><a href="/business/profile" className="mt-5 inline-block rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white">Set up Business Profile →</a></div>}
      {data && <form onSubmit={submit} aria-busy={!!busy}>
        <div className="mb-6 rounded-2xl border border-[#DCE5EB] bg-white p-6">
          <h2 className="text-xl font-bold">{data.business.officialName}</h2>
          <p className="mt-2 text-sm text-[#526B82]">Profile status: {statusLabel(data.business.verificationStatus)}</p>
          {locked && <p className="mt-3 text-sm text-[#9A6700]">This application is locked while it is under review or approved. <a href="/business/review-status" className="font-bold underline">View application status</a></p>}
        </div>
        <fieldset disabled={!!busy || locked || loading} className="grid gap-5 sm:grid-cols-2">
          {DOCUMENT_OPTIONS.map(option => {
            const saved = current.filter(document => document.type === option.type);
            return <section key={option.type} className="min-w-0 rounded-2xl border border-[#E3EAF0] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{option.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${option.required ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{option.required ? 'Required' : 'Optional'}</span></div>
              <p className="mt-3 text-xs leading-6 text-[#627D98]">{option.hint}</p>
              {saved.map(document => <div key={document._id} className="mt-4 rounded-xl border border-[#CDEEE1] bg-[#F0FDF8] p-3">
                <a href={documentDownloadUrl(document._id)} download className="block break-all text-xs font-bold text-[#047857] underline">{document.originalName}</a>
                <p className="mt-2 text-[11px] text-[#526B82]">{statusLabel(document.status)} · {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                {document.reviewNote && <p className="mt-2 text-xs text-amber-800">Reviewer note: {document.reviewNote}</p>}
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <button type="button" onClick={() => void remove(document._id)} className="font-semibold text-red-700 disabled:opacity-50">Remove</button>
                  <label className="relative font-semibold text-[#047857]">Replace
                    <input aria-label={`Replace ${document.originalName}`} type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full cursor-pointer opacity-0" onChange={event => { void upload(option.type, event.currentTarget.files, document._id); event.currentTarget.value = ''; }} />
                  </label>
                </div>
              </div>)}
              {(!saved.length || (option.type === 'other_supporting' && saved.length < 3)) && <div className="mt-4 rounded-xl border border-dashed border-[#BCCCDC] bg-[#F8FAFC] p-4" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void upload(option.type, Array.from(event.dataTransfer.files).slice(0, option.type === 'other_supporting' ? 3 - saved.length : 1)); }}>
                <label className="block text-xs font-semibold text-[#047857]">Upload {option.title}
                  <input aria-label={`Upload ${option.title}`} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple={option.type === 'other_supporting'} className="mt-3 block max-w-full text-xs text-[#526B82]" onChange={event => { void upload(option.type, Array.from(event.currentTarget.files ?? []).slice(0, option.type === 'other_supporting' ? 3 - saved.length : 1)); event.currentTarget.value = ''; }} />
                </label>
                <p className="mt-3 text-[10px] text-[#829AB1]">Drag and drop, or choose a file. PDF, JPEG or PNG. Maximum 5 MB each.</p>
              </div>}
            </section>;
          })}
        </fieldset>
        {busy && <div role="status" aria-live="polite" className="mt-5 rounded-xl bg-white p-5 text-sm"><p>{busy}{busy.startsWith('Uploading') ? ` — ${progress === 100 ? 'saving…' : `${progress}%`}` : '…'}</p>{busy.startsWith('Uploading') && <progress aria-label="Upload progress" value={progress} max={100} className="mt-3 w-full accent-[#059669]" />}</div>}
        {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`mt-5 rounded-xl border p-4 text-sm ${feedback.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{feedback.text}</p>}
        {!locked && <div className="mt-6 rounded-2xl border border-[#DCE5EB] bg-white p-6">
          <h2 className="font-bold">Before you submit</h2>
          {data.eligibility.eligible ? <p className="mt-3 text-sm text-[#047857]">All required profile fields and documents are saved.</p> : <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-800">{data.eligibility.missingDocuments.map(type => <li key={type}>Upload {documentLabel(type)}</li>)}{data.eligibility.rejectedDocuments.map(type => <li key={type}>Replace {documentLabel(type)}</li>)}{data.eligibility.missingFields.map(field => <li key={field}>Complete profile field: {field}</li>)}</ul>}
          <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#526B82]"><input type="checkbox" checked={confirmed} disabled={!!busy} onChange={event => setConfirmed(event.target.checked)} className="mt-1 accent-[#059669]" />I confirm that the uploaded documents are accurate and ready for review.</label>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><a href="/business/profile" className="text-sm font-bold text-[#526B82]">← Business Profile</a><button type="submit" disabled={!!busy || loading || !confirmed || !data.eligibility.eligible} className="rounded-xl bg-[#059669] px-6 py-3 text-sm font-bold text-white hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-50">{busy === 'Submitting your application' ? 'Submitting…' : 'Submit for Review →'}</button></div>
        </div>}
        {data.documents.some(document => !document.isCurrent) && <details className="mt-6 rounded-2xl bg-white p-5"><summary className="cursor-pointer text-sm font-bold">Previous document versions</summary><ul className="mt-4 space-y-3 text-xs">{data.documents.filter(document => !document.isCurrent).map(document => <li key={document._id}><a href={documentDownloadUrl(document._id)} download className="text-[#047857] underline">{document.originalName}</a> — {statusLabel(document.status)}</li>)}</ul></details>}
      </form>}
    </OnboardingLayout>
  );
}
