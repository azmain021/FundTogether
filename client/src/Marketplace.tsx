import { useMemo, useState, type ReactNode } from "react";
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

const campaigns = [
  {
    name: "Shobuj Bazar",
    category: "Grocery",
    location: "Dhaka",
    target: 5000000,
    raised: 3420000,
    targetLabel: "৳50,00,000",
    raisedLabel: "৳34,20,000",
    unit: "৳500",
    progress: 68,
    status: "Building momentum",
    added: 6,
    image:
      "https://images.unsplash.com/photo-1667312942298-4f4724f3a5d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxCYW5nbGFkZXNoJTIwc21hbGwlMjBidXNpbmVzcyUyMG1hcmtldCUyMGNsb3RoaW5nJTIwcG91bHRyeSUyMHNvbGFyJTIwYmFrZXJ5JTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3OTQ2NTg0NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Nodi Bangla Kitchen",
    category: "Restaurant",
    location: "Chattogram",
    target: 4800000,
    raised: 2500000,
    targetLabel: "৳48,00,000",
    raisedLabel: "৳25,00,000",
    unit: "৳1,000",
    progress: 52,
    status: "Building momentum",
    added: 5,
    image:
      "https://images.unsplash.com/photo-1692826090383-b793a5e4e81c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYW5nbGFkZXNoJTIwcmVzdGF1cmFudCUyMHNtYWxsJTIwYnVzaW5lc3MlMjBEaGFrYSUyMGludGVyaW9yJTIwb3duZXJ8ZW58MXx8fHwxNzk0NjU2Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Sylhet Oven",
    category: "Bakery",
    location: "Sylhet",
    target: 2250000,
    raised: 1460000,
    targetLabel: "৳22,50,000",
    raisedLabel: "৳14,60,000",
    unit: "৳500",
    progress: 65,
    status: "Building momentum",
    added: 4,
    image:
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXJzJTIwc2hvcCUyMHJlc3RhdXJhbnQlMjBiYWtlcnklMjByZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3OTQ2NTYzODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Deshi Threads",
    category: "Clothing",
    location: "Dhaka",
    target: 6000000,
    raised: 2760000,
    targetLabel: "৳60,00,000",
    raisedLabel: "৳27,60,000",
    unit: "৳1,000",
    progress: 46,
    status: "Early progress",
    added: 3,
    image:
      "https://images.unsplash.com/photo-1573612664822-d7d347da7b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGNsb3RoaW5nJTIwZmFzaGlvbiUyMHN0dWRpbyUyMHNtYWxsJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzk0NjU2Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Green Acre Poultry",
    category: "Agriculture",
    location: "Gazipur",
    target: 3000000,
    raised: 2280000,
    targetLabel: "৳30,00,000",
    raisedLabel: "৳22,80,000",
    unit: "৳500",
    progress: 76,
    status: "Near target",
    added: 2,
    image:
      "https://images.unsplash.com/photo-1715034076526-79a3241d046d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVlJTIwcmFuZ2UlMjBwb3VsdHJ5JTIwZmFybSUyMGNoaWNrZW5zfGVufDF8fHx8MTc5NDY1NjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Solar Horizon",
    category: "Renewable Energy",
    location: "Rajshahi",
    target: 9000000,
    raised: 7290000,
    targetLabel: "৳90,00,000",
    raisedLabel: "৳72,90,000",
    unit: "৳2,000",
    progress: 81,
    status: "Near target",
    added: 1,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMGVuZXJneSUyMGZhcm0lMjBwYW5lbHMlMjBidXNpbmVzc3xlbnwxfHx8fDE3OTQ2NTYzODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

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

function CampaignCard({ campaign }: { campaign: (typeof campaigns)[number] }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E3EAF0] bg-white shadow-[0_6px_24px_rgba(16,42,67,.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(16,42,67,.11)]">
      <div className="relative h-48 shrink-0 overflow-hidden sm:h-52">
        <img
          src={campaign.image}
          alt={`${campaign.name}, an illustrative ${campaign.category.toLowerCase()} campaign`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#102A43]/40 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#102A43] shadow-sm">
          {campaign.category}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-[#102A43]/85 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
          Illustrative
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex min-h-[58px] items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[19px] font-bold tracking-[-0.025em] text-[#102A43]">
              {campaign.name}
            </h2>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#627D98]">
              <MapPin className="h-3.5 w-3.5 text-[#829AB1]" /> {campaign.location}, Bangladesh
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-[#ECFDF5] px-2 py-1 text-[10px] font-bold text-[#047857]">
            {campaign.progress}%
          </span>
        </div>

        <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#CDEEE1] bg-[#F0FDF8] px-2.5 py-1.5 text-[10px] font-semibold text-[#047857]">
          <ShieldCheck className="h-3.5 w-3.5" /> Documents reviewed
        </div>

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
            <span className="font-medium text-[#627D98]">Illustrative funding progress</span>
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
          {campaign.name === "Shobuj Bazar" ? <a
            href="/campaigns/shobuj-bazar"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#102A43] px-4 text-xs font-bold text-white transition-colors hover:bg-[#183B56]"
          >
            View Details <ArrowRight />
          </a> : <span className="text-xs font-semibold text-[#829AB1]">Details coming soon</span>}
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

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = campaigns.filter((campaign) => {
      const matchesSearch = !query || campaign.name.toLowerCase().includes(query);
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
  }, [category, location, search, sort, status]);

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
              All businesses, documents, funding figures and progress shown are illustrative
              demonstration data.
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
                      placeholder="Search business name"
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
                  {Array.from(new Set(campaigns.map((campaign) => campaign.location))).map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </SelectControl>
                <SelectControl label="Funding status" value={status} onChange={setStatus}>
                  <option>All statuses</option>
                  <option>Early progress</option>
                  <option>Building momentum</option>
                  <option>Near target</option>
                </SelectControl>
                <SelectControl label="Sort by" value={sort} onChange={setSort}>
                  <option>Newest</option>
                  <option>Funding Progress</option>
                  <option>Funding Target</option>
                </SelectControl>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-[#102A43]">
                  {filteredCampaigns.length}{" "}
                  {filteredCampaigns.length === 1 ? "campaign" : "campaigns"} found
                </p>
                <p className="mt-1 text-xs text-[#829AB1]">Illustrative demonstration results</p>
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
            {filteredCampaigns.length > 0 ? (
              <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.name} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-[20px] border border-dashed border-[#BCCCDC] bg-white px-6 py-16 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#EDF2F7] text-[#627D98]">
                  <SearchIcon />
                </span>
                <h2 className="mt-4 text-lg font-bold text-[#102A43]">No campaigns found</h2>
                <p className="mt-2 text-sm text-[#627D98]">
                  Try changing your search or filter selections.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg bg-[#102A43] px-4 py-2.5 text-xs font-bold text-white"
                >
                  Reset filters
                </button>
              </div>
            )}

            {filteredCampaigns.length > 0 && (
              <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E3EAF0] bg-white px-5 py-4 sm:flex-row">
                <p className="text-xs font-medium text-[#627D98]">
                  Showing {filteredCampaigns.length} of {filteredCampaigns.length} illustrative
                  campaigns
                </p>
                <nav className="flex items-center gap-2" aria-label="Marketplace pagination">
                  <button
                    type="button"
                    disabled
                    className="h-9 rounded-lg border border-[#D9E2EC] px-3 text-xs font-semibold text-[#9FB3C8] disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#102A43] text-xs font-bold text-white">
                    1
                  </span>
                  <button
                    type="button"
                    disabled
                    className="h-9 rounded-lg border border-[#D9E2EC] px-3 text-xs font-semibold text-[#9FB3C8] disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
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
                Marketplace businesses, reviewed-document labels, BDT amounts and funding progress
                are illustrative demonstration data. Document review does not represent an
                endorsement or guarantee. No real investments, money transfers, guaranteed returns
                or financial transactions are offered.
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
