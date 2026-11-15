import { useMemo, useState } from "react";

type IconProps = { className?: string };

const ArrowLeft = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m5 5-5-5 5-5" />
  </svg>
);

const ArrowRight = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

const ShieldCheck = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
  </svg>
);

const MapPin = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
    />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);



const Building = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 21V5l8-3 8 3v16M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M9 21v-5h6v5"
    />
  </svg>
);

const Clock = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

const Menu = ({ className = "h-6 w-6" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const Close = ({ className = "h-6 w-6" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const UNIT_PRICE = 500;
const CAMPAIGN_TARGET = 5_000_000;
const TOTAL_UNITS = CAMPAIGN_TARGET / UNIT_PRICE;

const fundAllocation = [
  { label: "Inventory and stock", percent: 40, color: "#059669" },
  { label: "Store setup", percent: 30, color: "#102A43" },
  { label: "Equipment", percent: 20, color: "#3B82F6" },
  { label: "Operations", percent: 10, color: "#94A3B8" },
];

const formatTaka = (value: number) => `৳${Math.floor(value).toLocaleString("en-IN")}`;

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="/" className="inline-flex items-center gap-2.5" aria-label="FundTogether home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#059669] shadow-[0_6px_18px_rgba(5,150,105,.22)]">
        <span className="absolute left-[9px] h-[18px] w-[7px] -rotate-12 rounded-[3px] bg-white/85" />
        <span className="absolute right-[9px] h-[18px] w-[7px] rotate-12 rounded-[3px] bg-white" />
      </span>
      <span
        className={`text-[19px] font-bold tracking-[-0.04em] ${inverse ? "text-white" : "text-[#102A43]"}`}
      >
        Fund<span className="text-[#059669]">Together</span>
      </span>
    </a>
  );
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-[#E3EAF0] bg-white p-6 shadow-[0_6px_24px_rgba(16,42,67,.05)] sm:p-8 ${className}`}
    >
      <h2 className="text-xl font-bold tracking-[-0.025em] text-[#102A43]">{title}</h2>
      {children}
    </section>
  );
}

export default function CampaignDetails() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contribution, setContribution] = useState("5000");
  const [confirmation, setConfirmation] = useState("");

  const calculation = useMemo(() => {
    const enteredAmount = Math.max(0, Number(contribution) || 0);
    const eligibleAmount = Math.min(enteredAmount, CAMPAIGN_TARGET);
    const units = Math.floor(eligibleAmount / UNIT_PRICE);
    const allocatedAmount = units * UNIT_PRICE;
    const unallocated = enteredAmount - allocatedAmount;
    const percentage = (units / TOTAL_UNITS) * 100;

    return { enteredAmount, units, allocatedAmount, unallocated, percentage };
  }, [contribution]);

  const percentageLabel =
    calculation.percentage > 0 && calculation.percentage < 0.01
      ? "<0.01%"
      : `${calculation.percentage.toFixed(2).replace(/\.?0+$/, "")}%`;

  const simulateInvestment = (event: React.FormEvent) => {
    event.preventDefault();
    if (calculation.units < 1) {
      setConfirmation("Enter at least ৳500 to simulate one whole unit.");
      return;
    }

    setConfirmation(
      `Demonstration confirmed: ${calculation.units.toLocaleString("en-IN")} whole units allocated from a ${formatTaka(calculation.enteredAmount)} Virtual Balance. No real money was transferred.`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="relative z-50 border-b border-[#E7EDF2] bg-white/95 backdrop-blur">
        <div className="page-container flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Campaign navigation">
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#059669] transition-colors hover:text-[#047857]"
            >
              <ArrowLeft /> Back to Marketplace
            </a>
            <a href="/#how-it-works" className="nav-link">
              How It Works
            </a>
            <a href="/#about" className="nav-link">
              About
            </a>
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href="#simulation-notice"
              className="text-sm font-semibold text-[#334E68] transition-colors hover:text-[#059669]"
            >
              Simulation Notice
            </a>
            <a
              href="#calculator"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#059669] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,.2)] transition hover:bg-[#047857]"
            >
              Try Simulator
            </a>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-[#D9E2EC] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <Close /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <nav
            className="absolute inset-x-0 top-[76px] border-y border-[#E7EDF2] bg-white p-5 shadow-xl lg:hidden"
            aria-label="Mobile campaign navigation"
          >
            <div className="mx-auto flex max-w-[1240px] flex-col gap-1">
              {[
                ["Back to Marketplace", "/marketplace"],
                ["How It Works", "/#how-it-works"],
                ["About", "/#about"],
                ["Try Simulator", "#calculator"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-[#F4F8FA]"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="border-b border-[#E3EAF0] bg-white">
          <div className="page-container py-8 sm:py-10">
            <a
              href="/marketplace"
              className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#627D98] transition-colors hover:text-[#059669]"
            >
              <ArrowLeft /> All campaigns
            </a>
            <div className="grid overflow-hidden rounded-[24px] border border-[#E3EAF0] bg-white shadow-[0_20px_55px_rgba(16,42,67,.1)] lg:grid-cols-[1.08fr_.92fr]">
              <div className="relative min-h-[330px] overflow-hidden sm:min-h-[430px] lg:min-h-[520px]">
                <img
                  src="https://images.unsplash.com/photo-1667312942298-4f4724f3a5d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxCYW5nbGFkZXNoJTIwc21hbGwlMjBidXNpbmVzcyUyMG1hcmtldCUyMGNsb3RoaW5nJTIwcG91bHRyeSUyMHNvbGFyJTIwYmFrZXJ5JTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3OTQ2NTg0NzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Fresh produce at a Bangladesh market representing Shobuj Bazar"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/45 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-[#102A43] shadow-sm">
                  Grocery business
                </span>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#CDEEE1] bg-[#F0FDF8] px-2.5 py-1.5 text-[10px] font-bold text-[#047857]">
                    <ShieldCheck className="h-4 w-4" /> Documents reviewed
                  </span>
                  <span className="rounded-lg bg-[#EDF2F7] px-2.5 py-1.5 text-[10px] font-bold text-[#526B82]">
                    Illustrative data
                  </span>
                </div>
                <h1 className="mt-5 text-[38px] font-bold leading-tight tracking-[-0.05em] text-[#102A43] sm:text-[48px]">
                  Shobuj Bazar
                </h1>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#627D98]">
                  <MapPin className="text-[#059669]" /> Dhaka, Bangladesh
                </p>
                <p className="mt-5 text-sm leading-6 text-[#627D98]">
                  A demonstration grocery campaign showing how a neighbourhood business expansion
                  could be presented on FundTogether.
                </p>

                <p className="mt-8 text-[10px] font-bold uppercase tracking-[.12em] text-[#829AB1]">
                  Funding overview
                </p>
                <div className="mt-3">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[#627D98]">
                        Illustrative amount raised
                      </p>
                      <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#102A43]">
                        ৳34,20,000
                      </p>
                    </div>
                    <p className="text-xl font-bold text-[#059669]">68%</p>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E7EDF2]">
                    <div className="h-full w-[68%] rounded-full bg-[#059669]" />
                  </div>
                  <p className="mt-2 text-xs text-[#829AB1]">of ৳50,00,000 demonstration target</p>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[#E3EAF0] pt-6">
                  {[
                    ["Funding target", "৳50,00,000"],
                    ["Remaining amount", "৳15,80,000"],
                    ["Funding progress", "68%"],
                    ["Illustrative deadline", "31 Dec 2025"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-[.07em] text-[#829AB1]">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#102A43]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="page-container grid items-start gap-8 lg:grid-cols-[1fr_390px]">
            <div className="space-y-8">
              <SectionCard title="Campaign description">
                <p className="mt-4 text-[15px] leading-7 text-[#526B82]">
                  Shobuj Bazar wants to expand its neighbourhood grocery operation by opening
                  another location in Dhaka. The illustrative campaign demonstrates how additional
                  inventory, a practical store setup and essential equipment could support that
                  expansion while keeping daily operations stable.
                </p>
                <div className="mt-6 rounded-xl border border-[#DCE7ED] bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#627D98]">
                  This description and all business information are fictional demonstration data
                  created for the FundTogether simulation experience.
                </div>
              </SectionCard>

              <SectionCard title="Use of funds">
                <p className="mt-3 text-sm leading-6 text-[#627D98]">
                  Illustrative allocation of the ৳50,00,000 campaign target.
                </p>
                <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-[#E7EDF2]">
                  {fundAllocation.map((item) => (
                    <div
                      key={item.label}
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      title={`${item.label}: ${item.percent}%`}
                    />
                  ))}
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {fundAllocation.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-[#E3EAF0] px-4 py-3.5"
                    >
                      <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#334E68]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-[#102A43]">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Business information">
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: <Building />, label: "Business category", value: "Grocery" },
                    {
                      icon: <Building />,
                      label: "Business size",
                      value: "Small · 12 team members",
                    },
                    { icon: <MapPin />, label: "Location", value: "Dhaka, Bangladesh" },
                    {
                      icon: <Clock />,
                      label: "Operating history",
                      value: "6 years · Illustrative",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3 rounded-xl bg-[#F8FAFC] p-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#E7F8F1] text-[#059669]">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.07em] text-[#829AB1]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#102A43]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-[#E3EAF0] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[.07em] text-[#829AB1]">
                    Business description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#526B82]">
                    A neighbourhood grocery concept focused on convenient access to fresh produce,
                    pantry staples and everyday household essentials.
                  </p>
                </div>
              </SectionCard>

              <SectionCard title="Campaign updates">
                <div className="mt-6 space-y-0">
                  {[
                    {
                      date: "12 Sep 2025 · Illustrative",
                      title: "Second location shortlist completed",
                      text: "The demonstration campaign now includes three potential neighbourhood locations for comparison.",
                    },
                    {
                      date: "28 Aug 2025 · Illustrative",
                      title: "Supplier plan updated",
                      text: "The sample inventory plan was revised to include more local produce and staple suppliers.",
                    },
                    {
                      date: "14 Aug 2025 · Illustrative",
                      title: "Campaign published",
                      text: "Shobuj Bazar was added to the FundTogether demonstration marketplace.",
                    },
                  ].map((update, index, items) => (
                    <article key={update.title} className="relative flex gap-4 pb-7 last:pb-0">
                      {index < items.length - 1 && (
                        <span className="absolute bottom-0 left-[15px] top-8 w-px bg-[#D9E2EC]" />
                      )}
                      <span className="relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-4 border-white bg-[#DDF6EC] text-[#059669]">
                        <span className="h-2 w-2 rounded-full bg-[#059669]" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#829AB1]">
                          {update.date}
                        </p>
                        <h3 className="mt-1.5 text-sm font-bold text-[#102A43]">{update.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-[#627D98]">{update.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </div>

            <aside id="calculator" className="scroll-mt-24 lg:sticky lg:top-24">
              <form
                onSubmit={simulateInvestment}
                className="overflow-hidden rounded-[20px] border border-[#DCE5EB] bg-white shadow-[0_16px_42px_rgba(16,42,67,.11)]"
              >
                <div className="bg-[#102A43] px-6 py-6 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#5EE0B5]">
                    Demonstration tool
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-[-0.025em]">
                    Simulated investment calculator
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[#B7C9D8]">
                    Explore whole units using a Virtual Balance. No real money is involved.
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between rounded-xl bg-[#F3F7F9] px-4 py-3">
                    <span className="text-xs font-medium text-[#627D98]">Unit price</span>
                    <span className="text-sm font-bold text-[#102A43]">৳500</span>
                  </div>

                  <label className="mt-5 block">
                    <span className="mb-2 block text-xs font-bold text-[#334E68]">
                      Contribution amount
                    </span>
                    <span className="relative block">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#526B82]">
                        ৳
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="100"
                        value={contribution}
                        onChange={(event) => {
                          setContribution(event.target.value);
                          setConfirmation("");
                        }}
                        className="h-13 w-full rounded-xl border border-[#CBD5E1] bg-white pl-9 pr-4 text-base font-bold text-[#102A43] outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
                        aria-describedby="calculator-help"
                      />
                    </span>
                  </label>
                  <p id="calculator-help" className="mt-2 text-[10px] leading-4 text-[#829AB1]">
                    Whole units are calculated at ৳500 each. Amounts above the campaign target
                    remain unallocated.
                  </p>

                  <div className="mt-6 divide-y divide-[#E3EAF0] rounded-xl border border-[#E3EAF0]">
                    {[
                      ["Whole units", calculation.units.toLocaleString("en-IN")],
                      ["Allocated amount", formatTaka(calculation.allocatedAmount)],
                      ["Unallocated amount", formatTaka(calculation.unallocated)],
                      ["Share of total campaign units", percentageLabel],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <span className="text-[11px] font-medium text-[#627D98]">{label}</span>
                        <span className="text-xs font-bold text-[#102A43]">{value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(5,150,105,.2)] transition hover:bg-[#047857]"
                  >
                    Simulate Investment <ArrowRight />
                  </button>
                  <p className="mt-3 text-center text-[10px] leading-4 text-[#829AB1]">
                    This button creates a demonstration confirmation only. It does not process a
                    transaction.
                  </p>

                  {confirmation && (
                    <div
                      className="mt-5 rounded-xl border border-[#BDE8D9] bg-[#ECFDF5] p-4 text-xs leading-5 text-[#047857]"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="flex gap-2.5">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        <p className="font-semibold">{confirmation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </aside>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B2135] pt-16 text-[#B7C9D8]">
        <div className="page-container">
          <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Logo inverse />
              <p className="mt-5 max-w-[330px] text-sm leading-6 text-[#92A9BA]">
                Bringing people and growing businesses together through a transparent, educational
                simulation platform.
              </p>
            </div>
            {[
              ["Platform", ["Explore", "How It Works", "Raise Funding"]],
              ["Company", ["About Us", "Our Approach", "Contact"]],
              ["Legal", ["Privacy", "Terms", "Risk Information"]],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <h2 className="text-sm font-bold text-white">{heading}</h2>
                <ul className="mt-5 space-y-3.5">
                  {(links as string[]).map((link) => (
                    <li key={link}>
                      <a
                        href="#simulation-notice"
                        className="text-sm transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div id="simulation-notice" className="scroll-mt-20 border-b border-white/10 py-6">
            <div className="flex items-start gap-3 rounded-xl bg-white/[.04] px-4 py-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#5EE0B5]" />
              <p className="text-[11px] leading-5 text-[#92A9BA]">
                <strong className="font-semibold text-[#C8D6E0]">Simulation notice:</strong> Shobuj
                Bazar, its documents, updates, deadline, BDT amounts and campaign information are
                illustrative demonstration data. Document review is not an endorsement or guarantee.
                No real investments, money transfers, guaranteed returns or financial transactions
                are offered.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 py-7 text-xs sm:flex-row">
            <p>© 2025 FundTogether. All rights reserved.</p>
            <p>Built for opportunity. Designed for clarity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
