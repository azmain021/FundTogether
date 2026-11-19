import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { listPublishedCampaigns } from "./api/campaigns";
import type {
  BusinessSector,
  MarketplaceCampaignQuery,
  MarketplaceCampaignResponse,
  MarketplaceSort,
  PublishedCampaign,
} from "./api/types";
import AccountLinks from "./auth/AccountLinks";

const taka = new Intl.NumberFormat("en-BD");

const sectors: Array<{ value: BusinessSector; label: string }> = [
  { value: "grocery_retail", label: "Grocery / Retail" },
  { value: "restaurant_food", label: "Restaurant / Food" },
  { value: "bakery", label: "Bakery" },
  { value: "clothing_fashion", label: "Clothing / Fashion" },
  { value: "agriculture", label: "Agriculture" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "renewable_energy", label: "Renewable Energy" },
  { value: "transportation_delivery", label: "Transport / Delivery" },
  { value: "other", label: "Other" },
];

const sortOptions: Array<{ value: MarketplaceSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "ending_soon", label: "Ending soon" },
  { value: "most_funded", label: "Most funded" },
  { value: "least_remaining", label: "Fewest units remaining" },
];

function formatSector(value?: string) {
  if (!value) return "Uncategorized";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function readPositiveInteger(value: string | null) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function readQuery(params: URLSearchParams): MarketplaceCampaignQuery {
  const rawSector = params.get("sector");
  const rawStatus = params.get("status");
  const rawSort = params.get("sort");

  const sector = sectors.some((item) => item.value === rawSector)
    ? (rawSector as BusinessSector)
    : undefined;

  const status =
    rawStatus === "active" || rawStatus === "funded"
      ? rawStatus
      : undefined;

  const sort = sortOptions.some((item) => item.value === rawSort)
    ? (rawSort as MarketplaceSort)
    : "newest";

  return {
    q: params.get("q") || undefined,
    sector,
    division: params.get("division") || undefined,
    district: params.get("district") || undefined,
    minTarget: readPositiveInteger(params.get("minTarget")),
    maxTarget: readPositiveInteger(params.get("maxTarget")),
    status,
    sort,
    page: readPositiveInteger(params.get("page")) ?? 1,
    limit: 9,
  };
}

function CampaignCard({ campaign }: { campaign: PublishedCampaign }) {
  const business = campaign.businessSnapshot;
  const fundedUnits = Math.max(0, campaign.totalUnits - campaign.remainingUnits);
  const progress =
    campaign.totalUnits > 0
      ? Math.round((fundedUnits / campaign.totalUnits) * 100)
      : 0;

  const location = [business?.district, business?.division]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#DCE5EB] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-semibold text-[#334E68]">
          {formatSector(business?.sector)}
        </span>
        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857]">
          {campaign.status === "funded" ? "Funded" : "Active"}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#102A43]">
        {campaign.title}
      </h2>

      {business?.name && (
        <p className="mt-1 text-sm text-[#526B82]">{business.name}</p>
      )}

      {location && (
        <p className="mt-2 text-sm text-[#627D98]">{location}, Bangladesh</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#E8EEF2] py-4">
        <div>
          <p className="text-xs text-[#627D98]">Virtual target</p>
          <p className="mt-1 font-bold text-[#102A43]">
            ৳{taka.format(campaign.fundingTarget)}
          </p>
        </div>
        <div className="border-l border-[#E8EEF2] pl-4">
          <p className="text-xs text-[#627D98]">Virtual raised</p>
          <p className="mt-1 font-bold text-[#102A43]">
            ৳{taka.format(fundedUnits * campaign.unitPrice)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs">
          <span className="text-[#627D98]">Funding progress</span>
          <span className="font-bold text-[#047857]">{progress}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E7EDF2]">
          <div
            className="h-full rounded-full bg-[#059669]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <div>
          <p className="text-xs text-[#627D98]">Virtual unit price</p>
          <p className="mt-1 font-bold text-[#102A43]">
            ৳{taka.format(campaign.unitPrice)}
          </p>
        </div>

        <Link
          to={`/campaigns/${campaign._id}`}
          className="rounded-lg bg-[#ECFDF5] px-4 py-2 text-sm font-bold text-[#047857] transition hover:bg-[#D1FAE5]"
        >
          View campaign
        </Link>
      </div>
    </article>
  );
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKey = searchParams.toString();

  const query = useMemo(
    () => readQuery(new URLSearchParams(queryKey)),
    [queryKey],
  );

  const [retry, setRetry] = useState(0);
  const requestKey = `${queryKey}|${retry}`;

  const [feed, setFeed] = useState<{
    requestKey: string;
    data: MarketplaceCampaignResponse | null;
    error: string;
  }>({
    requestKey: "",
    data: null,
    error: "",
  });

  const loading = feed.requestKey !== requestKey;
  const data = feed.requestKey === requestKey ? feed.data : null;
  const error = feed.requestKey === requestKey ? feed.error : "";

  useEffect(() => {
    const controller = new AbortController();

    listPublishedCampaigns(query, controller.signal).then(
      (response) => {
        if (!controller.signal.aborted) {
          setFeed({
            requestKey,
            data: response,
            error: "",
          });
        }
      },
      (requestError: unknown) => {
        if (!controller.signal.aborted) {
          setFeed({
            requestKey,
            data: null,
            error:
              requestError instanceof Error
                ? requestError.message
                : "Campaigns could not be loaded.",
          });
        }
      },
    );

    return () => controller.abort();
  }, [query, requestKey]);

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value.trim()) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    if (name !== "page") {
      next.delete("page");
    }

    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / (query.limit ?? 9)))
    : 1;

  const hasFilters = Boolean(
    query.q ||
      query.sector ||
      query.division ||
      query.district ||
      query.minTarget ||
      query.maxTarget ||
      query.status ||
      query.sort !== "newest",
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#102A43]">
      <header className="border-b border-[#DCE5EB] bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <Link to="/" className="text-xl font-bold">
            Fund<span className="text-[#059669]">Together</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm font-semibold">
            <Link to="/marketplace" className="text-[#047857]">
              Explore
            </Link>
            <Link to="/#how-it-works">How it works</Link>
          </nav>

          <AccountLinks />
        </div>
      </header>

      <main>
        <section className="border-b border-[#E0E7ED] bg-white">
          <div className="page-container py-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Explore Business Opportunities
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[#526B82]">
              Browse simulated funding campaigns from businesses across Bangladesh.
            </p>
            <p className="mt-2 text-xs text-[#829AB1]">
              All figures are virtual and used only for this educational simulation.
            </p>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-7">
          <div className="page-container">
            <div className="rounded-2xl border border-[#DCE5EB] bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Search
                  </span>
                  <input
                    type="search"
                    value={query.q ?? ""}
                    onChange={(event) => setFilter("q", event.target.value)}
                    placeholder="Campaign or business"
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] px-3 text-sm outline-none focus:border-[#059669]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Sector
                  </span>
                  <select
                    value={query.sector ?? ""}
                    onChange={(event) => setFilter("sector", event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] bg-white px-3 text-sm outline-none focus:border-[#059669]"
                  >
                    <option value="">All sectors</option>
                    {sectors.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Division
                  </span>
                  <input
                    value={query.division ?? ""}
                    onChange={(event) => setFilter("division", event.target.value)}
                    placeholder="e.g. Dhaka"
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] px-3 text-sm outline-none focus:border-[#059669]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    District
                  </span>
                  <input
                    value={query.district ?? ""}
                    onChange={(event) => setFilter("district", event.target.value)}
                    placeholder="e.g. Gazipur"
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] px-3 text-sm outline-none focus:border-[#059669]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Minimum target
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={query.minTarget?.toString() ?? ""}
                    onChange={(event) => setFilter("minTarget", event.target.value)}
                    placeholder="Virtual taka"
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] px-3 text-sm outline-none focus:border-[#059669]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Maximum target
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={query.maxTarget?.toString() ?? ""}
                    onChange={(event) => setFilter("maxTarget", event.target.value)}
                    placeholder="Virtual taka"
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] px-3 text-sm outline-none focus:border-[#059669]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Funding status
                  </span>
                  <select
                    value={query.status ?? ""}
                    onChange={(event) => setFilter("status", event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] bg-white px-3 text-sm outline-none focus:border-[#059669]"
                  >
                    <option value="">Active and funded</option>
                    <option value="active">Active</option>
                    <option value="funded">Funded</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#627D98]">
                    Sort by
                  </span>
                  <select
                    value={query.sort ?? "newest"}
                    onChange={(event) => setFilter("sort", event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#D9E2EC] bg-white px-3 text-sm outline-none focus:border-[#059669]"
                  >
                    {sortOptions.map((sort) => (
                      <option key={sort.value} value={sort.value}>
                        {sort.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 py-6">
              <p aria-live="polite" className="text-sm font-semibold">
                {loading ? "Loading campaigns…" : `${data?.total ?? 0} campaigns found`}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-bold text-[#047857] hover:text-[#065F46]"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {error}{" "}
                <button
                  type="button"
                  onClick={() => setRetry((value) => value + 1)}
                  className="font-bold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {loading && (
              <p role="status" className="py-8 text-sm text-[#526B82]">
                Loading campaigns…
              </p>
            )}

            {!loading && !error && data && data.items.length > 0 && (
              <>
                <div className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((campaign) => (
                    <CampaignCard key={campaign._id} campaign={campaign} />
                  ))}
                </div>

                <nav
                  className="mt-10 flex items-center justify-center gap-4"
                  aria-label="Marketplace pagination"
                >
                  <button
                    type="button"
                    disabled={query.page === 1}
                    onClick={() => goToPage((query.page ?? 1) - 1)}
                    className="rounded-lg border border-[#D9E2EC] px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-[#526B82]">
                    Page {query.page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={query.page === totalPages}
                    onClick={() => goToPage((query.page ?? 1) + 1)}
                    className="rounded-lg border border-[#D9E2EC] px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </>
            )}

            {!loading && !error && data && data.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#BCCCDC] bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-bold">
                  {hasFilters ? "No campaigns found" : "No published campaigns yet"}
                </h2>
                <p className="mt-2 text-sm text-[#627D98]">
                  {hasFilters
                    ? "Try changing or clearing your filters."
                    : "Approved active campaigns will appear here."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-lg bg-[#102A43] px-4 py-2 text-sm font-bold text-white"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-[#0B2135] py-8 text-center text-xs text-[#B7C9D8]">
        FundTogether is an educational simulation. No real investments or money transfers occur.
      </footer>
    </div>
  );
}