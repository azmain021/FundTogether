import { useEffect, useMemo, useState, type ReactNode } from "react";
import { listPublishedCampaigns } from "./api/campaigns";
import type { PublishedCampaign } from "./api/types";
import AccountLinks from "./auth/AccountLinks";

type IconProps = { className?: string };

const SearchIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m16 16 4 4" />
  </svg>
);

const ChevronDown = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
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

const ShieldCheck = ({ className = "h-4 w-4" }: IconProps) => (
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

const taka = new Intl.NumberFormat("en-BD");

function displayCampaign(campaign: PublishedCampaign) {
  const business = campaign.businessSnapshot;
  const unitsFunded = Math.max(0, campaign.totalUnits - campaign.remainingUnits);
  return {
    id: campaign._id,
    name: campaign.title,
    businessName: business?.name ?? "",
    category: business?.sector.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Uncategorized",
    location: business?.district || business?.division || "",
    target: campaign.fundingTarget,
    targetLabel: `৳${taka.format(campaign.fundingTarget)}`,
    raisedLabel: `৳${taka.format(unitsFunded * campaign.unitPrice)}`,
    unit: `৳${taka.format(campaign.unitPrice)}`,
    progress: campaign.totalUnits > 0 ? Math.min(100, Math.round(unitsFunded / campaign.totalUnits * 100)) : 0,
    status: campaign.status === "funded" ? "Funded" : "Active",
    added: campaign.startsAt ? Date.parse(campaign.startsAt) : 0,
  };
}

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

function SelectControl({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.1em] text-[#627D98]">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-[#D9E2EC] bg-white px-3.5 pr-9 text-sm font-medium text-[#243B53] outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829AB1]" />
      </span>
    </label>
  );
}

function CampaignCard({ campaign }: { campaign: ReturnType<typeof displayCampaign> }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E3EAF0] bg-white shadow-[0_6px_24px_rgba(16,42,67,.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(16,42,67,.11)]">
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-[#EDF2F7] px-3 py-1.5 text-xs font-semibold">{campaign.category}</span>
          <span className="rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-bold text-[#047857]">{campaign.status}</span>
        </div>
        <h2 className="mt-4 break-words text-[19px] font-bold tracking-[-0.025em]">{campaign.name}</h2>
        {campaign.businessName && <p className="mt-1 text-sm text-[#526B82]">{campaign.businessName}</p>}
        {campaign.location && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#627D98]">
            <MapPin className="h-3.5 w-3.5 text-[#829AB1]" /> {campaign.location}, Bangladesh
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#E8EEF2] py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.07em] text-[#829AB1]">
              Funding target
            </p>
            <p className="mt-1 text-sm font-bold text-[#102A43]">{campaign.targetLabel}</p>
          </div>
          <div className="border-l border-[#E8EEF2] pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.07em] text-[#829AB1]">
              Amount raised
            </p>
            <p className="mt-1 text-sm font-bold text-[#102A43]">{campaign.raisedLabel}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#627D98]">Simulated funding progress</span>
            <span className="font-bold text-[#059669]">{campaign.progress}%</span>
          </div>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#E7EDF2]">
            <div
              className="h-full rounded-full bg-[#059669]"
              style={{ width: `${campaign.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-[10px] font-medium text-[#829AB1]">Simulated unit price</p>
            <p className="mt-0.5 text-sm font-bold text-[#102A43]">{campaign.unit}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Marketplace() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [location, setLocation] = useState("All locations");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("Newest");

  const [feed, setFeed] = useState<{ attempt: number; campaigns?: PublishedCampaign[]; failed?: boolean }>();
  const [attempt, setAttempt] = useState(0);
  const currentFeed = feed?.attempt === attempt ? feed : undefined;

  useEffect(() => {
    const controller = new AbortController();
    listPublishedCampaigns(controller.signal).then(
      (campaigns) => { if (!controller.signal.aborted) setFeed({ attempt, campaigns }); },
      () => { if (!controller.signal.aborted) setFeed({ attempt, failed: true }); },
    );
    return () => controller.abort();
  }, [attempt]);

  const campaigns = useMemo(() => (currentFeed?.campaigns ?? []).map(displayCampaign), [currentFeed]);

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(query) || campaign.businessName.toLowerCase().includes(query);
      const matchesCategory = category === "All categories" || campaign.category === category;
      const matchesLocation = location === "All locations" || campaign.location === location;
      const matchesStatus = status === "All statuses" || campaign.status === status;
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });

    return [...results].sort((a, b) => {
      if (sort === "Funding Progress") return b.progress - a.progress;
      if (sort === "Funding Target") return b.target - a.target;
      return b.added - a.added;
    });
  }, [campaigns, category, location, search, sort, status]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All categories");
    setLocation("All locations");
    setStatus("All statuses");
    setSort("Newest");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#102A43]">
      <header className="relative z-50 border-b border-[#E7EDF2] bg-white/95 backdrop-blur">
        <div className="page-container flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary navigation">
            <a
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#059669]"
              aria-current="page"
            >
              Explore <ChevronDown />
            </a>
            <a href="/#how-it-works" className="nav-link">
              How It Works
            </a>
            <a href="/#about" className="nav-link">
              About
            </a>
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <AccountLinks />
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
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex max-w-[1240px] flex-col gap-1">
              {[
                ["Explore", "/marketplace"],
                ["How It Works", "/#how-it-works"],
                ["About", "/#about"],
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
              <AccountLinks mobile />
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="border-b border-[#E7EDF2] bg-white">
          <div className="page-container py-10 text-center sm:py-12">
            <h1 className="mx-auto max-w-[760px] text-[36px] font-bold leading-[1.1] tracking-[-0.05em] text-[#102A43] sm:text-[44px]">
              Explore Business Opportunities
            </h1>
            <p className="mx-auto mt-4 max-w-[680px] text-[15px] leading-7 text-[#526B82] sm:text-[16px]">
              Discover businesses across Bangladesh and explore their simulated funding campaigns.
            </p>
            <p className="mx-auto mt-2 max-w-[620px] text-[11px] leading-5 text-[#829AB1]">
              Funding figures and unit prices are for the simulation.
            </p>
          </div>
        </section>

        <section className="bg-[#F8FAFC] pt-6">
          <div className="page-container">
            <div className="rounded-[18px] border border-[#E0E7ED] bg-white p-4 shadow-[0_10px_30px_rgba(16,42,67,.07)] sm:p-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr_1fr]">
                <label className="block min-w-0">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.1em] text-[#627D98]">
                    Search
                  </span>
                  <span className="relative block">
                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#829AB1]" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search campaigns or businesses"
                      className="h-12 w-full rounded-xl border border-[#D9E2EC] bg-white pl-11 pr-4 text-sm text-[#243B53] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
                    />
                  </span>
                </label>
                <SelectControl label="Category" value={category} onChange={setCategory}>
                  <option>All categories</option>
                  {Array.from(new Set(campaigns.map((campaign) => campaign.category))).map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </SelectControl>
                <SelectControl label="Location" value={location} onChange={setLocation}>
                  <option>All locations</option>
                  {Array.from(new Set(campaigns.map((campaign) => campaign.location).filter(Boolean))).map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </SelectControl>
                <SelectControl label="Funding status" value={status} onChange={setStatus}>
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Funded</option>
                </SelectControl>
                <SelectControl label="Sort by" value={sort} onChange={setSort}>
                  <option>Newest</option>
                  <option>Funding Progress</option>
                  <option>Funding Target</option>
                </SelectControl>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center">
              <div aria-live="polite">
                {currentFeed?.campaigns && <p className="text-sm font-bold text-[#102A43]">
                  {filteredCampaigns.length}{" "}
                  {filteredCampaigns.length === 1 ? "campaign" : "campaigns"} found
                </p>}
              </div>
              {(search ||
                category !== "All categories" ||
                location !== "All locations" ||
                status !== "All statuses" ||
                sort !== "Newest") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-fit text-xs font-bold text-[#059669] hover:text-[#047857]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </section>

        <section id="campaigns" className="scroll-mt-24 bg-[#F8FAFC] pb-24">
          <div className="page-container">
            {!currentFeed ? (
              <p role="status" className="py-6 text-sm text-[#526B82]">Loading campaigns…</p>
            ) : currentFeed.failed ? (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                Campaigns could not be loaded.{' '}
                <button type="button" onClick={() => setAttempt(value => value + 1)} className="font-bold underline">Try again</button>
              </p>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-[20px] border border-dashed border-[#BCCCDC] bg-white px-6 py-16 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#EDF2F7] text-[#627D98]">
                  <SearchIcon />
                </span>
                <h2 className="mt-4 text-lg font-bold text-[#102A43]">{campaigns.length ? "No campaigns found" : "No published campaigns yet"}</h2>
                {campaigns.length > 0 && (
                  <>
                    <p className="mt-2 text-sm text-[#627D98]">Try changing your search or filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-5 rounded-lg bg-[#102A43] px-4 py-2.5 text-xs font-bold text-white"
                    >
                      Reset filters
                    </button>
                  </>
                )}
              </div>
            )}
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
                        href="#marketplace-notice"
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
          <div id="marketplace-notice" className="scroll-mt-20 border-b border-white/10 py-6">
            <div className="flex items-start gap-3 rounded-xl bg-white/[.04] px-4 py-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#5EE0B5]" />
              <p className="text-[11px] leading-5 text-[#92A9BA]">
                <strong className="font-semibold text-[#C8D6E0]">Simulation notice:</strong>{" "}
                Campaign funding and progress use simulated BDT. No real investments, money
                transfers, guaranteed returns or financial transactions are offered.
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
