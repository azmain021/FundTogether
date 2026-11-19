import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getPublishedCampaign } from "../api/campaigns";
import type { PublishedCampaignDetail } from "../api/types";
import AccountLinks from "../auth/AccountLinks";
import { useSession } from "../auth/session";
import WatchlistButton from "../watchlists/WatchlistButton";
import { useWatchlist } from "../watchlists/use-watchlist";
import { formatTaka } from "../wallet/format-taka";
import InvestmentCheckout from "./InvestmentCheckout";

function CampaignPage({ id }: { id: string }) {
  const { user, loading: sessionLoading } = useSession();
  const watchlist = useWatchlist();
  const [campaign, setCampaign] = useState<PublishedCampaignDetail>();
  const [error, setError] = useState("");

  useEffect(() => {
    const request = new AbortController();

    getPublishedCampaign(id, request.signal)
      .then(setCampaign)
      .catch((requestError: unknown) => {
        if (!request.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load this campaign.",
          );
        }
      });

    return () => request.abort();
  }, [id]);

  async function refreshCampaign() {
    setCampaign(await getPublishedCampaign(id));
  }

  const status =
    campaign?.status === "funded"
      ? "Funded"
      : campaign?.acceptingInvestments
        ? "Active"
        : "Closed";

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="border-b border-[#DCE5EB] bg-white">
        <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <Link to="/" className="text-xl font-bold">
            Fund<span className="text-[#059669]">Together</span>
          </Link>
          <AccountLinks />
        </div>
      </header>

      <main className="page-container py-10">
        <Link
          to="/marketplace"
          className="text-sm font-semibold text-[#047857]"
        >
          Back to marketplace
        </Link>

        {error && (
          <p role="alert" className="mt-6 text-sm text-red-700">
            {error}
          </p>
        )}

        {watchlist.enabled && watchlist.error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            Watchlist: {watchlist.error}
          </p>
        )}

        {!error && !campaign && (
          <p role="status" className="mt-6 text-sm text-[#526B82]">
            Loading campaign…
          </p>
        )}

        {campaign && (
          <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
            <article className="min-w-0 rounded-2xl border border-[#DCE5EB] bg-white p-6 sm:p-8">
              <p className="text-sm font-semibold text-[#047857]">
                {status}
              </p>

              <div className="mt-2 flex items-start justify-between gap-4">
                <div>
                  <h1 className="break-words text-3xl font-bold">
                    {campaign.title}
                  </h1>

                  {campaign.businessSnapshot && (
                    <p className="mt-2 text-sm text-[#526B82]">
                      {campaign.businessSnapshot.name} ·{" "}
                      {campaign.businessSnapshot.district}
                    </p>
                  )}
                </div>

                {watchlist.enabled && (
                  <WatchlistButton
                    campaignId={campaign._id}
                    saved={watchlist.isSaved(campaign._id)}
                    pending={watchlist.updatingId === campaign._id}
                    disabled={!watchlist.ready}
                    onToggle={watchlist.toggle}
                  />
                )}
              </div>

              <p className="mt-5 whitespace-pre-wrap break-words leading-7 text-[#334E68]">
                {campaign.description}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-[#DCE5EB] py-5 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-[#526B82]">
                    Virtual funding target
                  </dt>
                  <dd className="mt-1 font-bold">
                    {formatTaka(campaign.fundingTarget)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[#526B82]">Unit price</dt>
                  <dd className="mt-1 font-bold">
                    {formatTaka(campaign.unitPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-[#526B82]">Units remaining</dt>
                  <dd
                    className="mt-1 font-bold"
                    data-testid="campaign-remaining"
                  >
                    {campaign.remainingUnits.toLocaleString("en-BD")}
                  </dd>
                </div>
              </dl>

              <h2 className="mt-6 font-bold">Purpose</h2>
              <p className="mt-1 whitespace-pre-wrap break-words text-[#334E68]">
                {campaign.purpose}
              </p>

              <h2 className="mt-4 font-bold">Use of funds</h2>
              <p className="mt-1 whitespace-pre-wrap break-words text-[#334E68]">
                {campaign.useOfFunds}
              </p>
            </article>

            {user?.role === "investor" && (
              <InvestmentCheckout
                key={user.id}
                campaign={campaign}
                investorId={user.id}
                onRefresh={refreshCampaign}
              />
            )}

            {!sessionLoading && !user && status === "Active" && (
              <aside className="rounded-2xl border border-[#DCE5EB] bg-white p-6">
                <h2 className="text-xl font-bold">Buy virtual units</h2>
                <Link
                  to={`/login?next=${encodeURIComponent(`/campaigns/${id}`)}`}
                  className="mt-4 inline-block font-semibold text-[#047857]"
                >
                  Log in as an investor
                </Link>
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PublishedCampaignPage() {
  const { id = "" } = useParams();
  return <CampaignPage key={id} id={id} />;
}