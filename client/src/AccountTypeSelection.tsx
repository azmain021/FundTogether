export default function AccountTypeSelection() {
  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#E3EAF0] bg-white">
        <div className="page-container flex h-[76px] items-center justify-between">
          <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
          <a href="/login" className="text-sm font-semibold text-[#047857]">Log in</a>
        </div>
      </header>
      <main className="page-container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#059669]">Join FundTogether</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">How would you like to join?</h1>
          <p className="mt-4 text-[#526B82]">Choose your account type to get started. All funding activity is simulated.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <section className="flex flex-col rounded-3xl border border-[#DCE5EB] bg-white p-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#829AB1]">Investor</span>
              <h2 className="mt-4 text-2xl font-bold">Discover businesses</h2>
              <p className="mt-3 grow text-sm leading-6 text-[#526B82]">Explore opportunities and participate using a virtual balance.</p>
              <button disabled className="mt-8 rounded-xl bg-[#EDF2F7] px-4 py-3 text-sm font-semibold text-[#64748B]">Investor registration — coming soon</button>
            </section>
            <section className="flex flex-col rounded-3xl border border-[#059669] bg-white p-8 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-[#059669]">Business Owner</span>
              <h2 className="mt-4 text-2xl font-bold">Build your business profile</h2>
              <p className="mt-3 grow text-sm leading-6 text-[#526B82]">Create your owner account, set up your profile and prepare for verification.</p>
              <a href="/business/register" className="mt-8 rounded-xl bg-[#059669] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#047857]">Create as Business Owner →</a>
            </section>
          </div>
          <p className="mt-8 text-sm text-[#526B82]">Already have an account? <a href="/login" className="font-bold text-[#047857]">Log in</a></p>
          <a href="/" className="mt-6 inline-block text-sm text-[#526B82]">← Back to home</a>
        </div>
      </main>
    </div>
  );
}
