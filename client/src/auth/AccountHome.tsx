import AccountLinks from './AccountLinks';
import { useSession } from './session';

export default function AccountHome({ role }: { role: 'admin' | 'investor' }) {
  const { user } = useSession();
  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#DCE5EB] bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
          <AccountLinks />
        </div>
      </header>
      <main className="page-container py-12">
        <h1 className="text-3xl font-bold">{role === 'admin' ? 'Administrator account' : 'Investor account'}</h1>
        <p className="mt-3 text-sm text-[#526B82]">Signed in as {user?.displayName} ({user?.email}).</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {role === 'admin' && <a href="/admin/campaigns" className="rounded-xl bg-[#047857] px-5 py-3 text-sm font-bold text-white hover:bg-[#065F46]">Campaign review</a>}
          <a href="/marketplace" className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-sm font-bold text-[#047857]">Browse campaigns</a>
        </div>
      </main>
    </div>
  );
}
