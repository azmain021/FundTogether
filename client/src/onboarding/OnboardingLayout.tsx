import type { ReactNode } from 'react';
import AccountLinks from '../auth/AccountLinks';

export default function OnboardingLayout({ title, description, step, children }: { title: string; description: string; step: number; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#E3EAF0] bg-white">
        <div className="page-container flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <a href="/" className="text-xl font-bold">Fund<span className="text-[#059669]">Together</span></a>
          <nav aria-label="Primary navigation" className="flex gap-5 text-sm font-semibold"><a href="/marketplace">Explore</a><a href="/business/review-status">Application Status</a></nav>
          <AccountLinks />
        </div>
      </header>
      <main className="page-container py-10 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-widest text-[#059669]">Business owner onboarding</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#526B82]">{description}</p>
        <div className="mt-9 grid gap-7 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl bg-[#102A43] p-7 text-white lg:self-start">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5EE0B5]">Your application journey</p>
            <h2 className="mt-4 text-xl font-bold">Four clear steps to your campaign</h2>
            <ol className="mt-7 grid gap-6 sm:grid-cols-4 lg:grid-cols-1">
              {['Account Registration', 'Business Profile', 'Documents & Review', 'Campaign Creation'].map((label, index) => (
                <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className="flex items-center gap-3 text-sm">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index + 1 <= step ? 'bg-[#059669] text-white' : 'bg-white/10 text-[#92A9BA]'}`}>{index + 1}</span>
                  <span className={index + 1 === step ? 'font-bold text-white' : 'text-[#B7C9D8]'}>{label}</span>
                </li>
              ))}
            </ol>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
      <footer className="mt-10 bg-[#0B2135] px-6 py-7 text-center text-xs leading-6 text-[#B7C9D8]">FundTogether is an educational simulation. All funding activity is virtual.</footer>
    </div>
  );
}
