import { documentDownloadUrl } from '../api/onboarding';
import { DOCUMENT_OPTIONS, statusLabel } from './document-options';
import OnboardingLayout from './OnboardingLayout';
import { useRegistration } from './use-registration';

export default function RegistrationStatus() {
  const { data, loading, error, reload } = useRegistration();
  const application = data?.application;
  const status = application?.status ?? 'not_submitted';
  const current = data?.documents.filter(document => document.isCurrent) ?? [];
  const canEdit = !!data && ['draft', 'rejected', 'changes_requested'].includes(data.business.verificationStatus);
  return (
    <OnboardingLayout title="Your Business Application" description="View your saved registration, supporting documents and current application status." step={3}>
      {loading && <p role="status" className="mb-5 rounded-xl bg-white p-5">Refreshing application status…</p>}
      {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-5 text-sm text-red-800">{error}<button onClick={() => void reload()} className="ml-3 underline">Try again</button></p>}
      {!loading && !error && !data && <section className="rounded-2xl bg-white p-8"><h2 className="text-xl font-bold">Your business profile is not set up yet</h2><a href="/business/profile" className="mt-5 inline-block font-bold text-[#047857]">Set up your Business Profile →</a></section>}
      {data && <div className="space-y-6">
        <section className="rounded-2xl border border-[#DCE5EB] bg-white p-7">
          <div className="flex flex-wrap items-center justify-between gap-4"><span className="rounded-full bg-[#ECFDF5] px-3 py-2 text-xs font-bold text-[#047857]">{statusLabel(status)}</span><button type="button" disabled={loading} onClick={() => void reload()} className="text-xs font-bold text-[#526B82] disabled:opacity-50">Refresh status</button></div>
          <h2 className="mt-5 text-2xl font-bold">{data.business.officialName}</h2>
          <p className="mt-3 text-sm leading-7 text-[#526B82]">{status === 'not_submitted' ? 'Your profile is saved. Upload all required documents and submit your application when ready.' : status === 'approved' ? 'Your business application has been approved.' : status === 'rejected' || status === 'changes_requested' ? 'Your application needs attention. Review the feedback below, update your documents and submit another round.' : 'Your application has been submitted and is awaiting an administrator’s review.'}</p>
          {application && <dl className="mt-6 grid gap-5 rounded-xl bg-[#F8FAFC] p-5 text-sm sm:grid-cols-2"><div><dt className="text-xs text-[#829AB1]">Application reference</dt><dd className="mt-2 break-all font-semibold">{application._id}</dd></div><div><dt className="text-xs text-[#829AB1]">Submitted</dt><dd className="mt-2 font-semibold">{new Date(application.submittedAt).toLocaleString()}</dd></div><div><dt className="text-xs text-[#829AB1]">Submission round</dt><dd className="mt-2 font-semibold">{application.round}</dd></div><div><dt className="text-xs text-[#829AB1]">Business verification</dt><dd className="mt-2 font-semibold">{statusLabel(data.business.verificationStatus)}</dd></div></dl>}
          {application?.decisionReason && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Reviewer feedback: {application.decisionReason}</p>}
        </section>
        <section className="rounded-2xl border border-[#DCE5EB] bg-white p-7"><h2 className="text-xl font-bold">Saved Documents</h2><ul className="mt-4 divide-y divide-[#E3EAF0]">{DOCUMENT_OPTIONS.map(option => {
          const documents = current.filter(document => document.type === option.type);
          return <li key={option.type} className="py-4"><div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold">{option.title}</span><span className="text-xs text-[#829AB1]">{option.required ? 'Required' : 'Optional'}</span></div>{documents.length ? documents.map(document => <div key={document._id} className="mt-3 rounded-xl bg-[#F8FAFC] p-3 text-xs"><a href={documentDownloadUrl(document._id)} download className="break-all font-semibold text-[#047857] underline">{document.originalName}</a><p className="mt-2 text-[#526B82]">{statusLabel(document.status)}</p>{document.reviewNote && <p className="mt-2 text-amber-800">{document.reviewNote}</p>}</div>) : <p className="mt-2 text-xs text-[#829AB1]">Not uploaded</p>}</li>;
        })}</ul></section>
        <section className="rounded-2xl border border-[#DCE5EB] bg-[#EDF2F7] p-6"><h2 className="font-bold">Campaign creation</h2><p className="mt-3 text-sm leading-6 text-[#526B82]">{data.business.verificationStatus === 'approved' ? 'Business verification is complete. Campaign creation is handled in the campaign module.' : 'Campaign creation remains locked until an administrator approves your business.'}</p></section>
        <div className="flex flex-wrap gap-4"><a href="/business/profile" className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-sm font-bold">View Business Profile</a><a href="/business/documents" className="rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white">{canEdit ? 'Manage Documents →' : 'View Documents →'}</a></div>
      </div>}
    </OnboardingLayout>
  );
}
