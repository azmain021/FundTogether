import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listWatchlist, removeFromWatchlist } from "../api/watchlists";
import type { WatchlistItem } from "../api/types";
import AccountLinks from "../auth/AccountLinks";
import { formatTaka } from "../wallet/format-taka";

type Feed = {
  requestKey: string;
  items: WatchlistItem[];
  error: string;
};

export default function WatchlistPage() {
  const [reload, setReload] = useState(0);
  const requestKey = String(reload);

  const [feed, setFeed] = useState<Feed>({
    requestKey: "",
    items: [],
    error: "",
  });

  const [removingId, setRemovingId] = useState<string | null>(null);

  const loading = feed.requestKey !== requestKey;
  const items = feed.requestKey === requestKey ? feed.items : [];
  const error = feed.requestKey === requestKey ? feed.error : "";

  useEffect(() => {
    const controller = new AbortController();

    listWatchlist(controller.signal).then(
      (response) => {
        if (!controller.signal.aborted) {
          setFeed({
            requestKey,
            items: response,
            error: "",
          });
        }
      },
      (requestError: unknown) => {
        if (!controller.signal.aborted) {
          setFeed({
            requestKey,
            items: [],
            error:
              requestError instanceof Error
                ? requestError.message
                : "Could not load your watchlist.",
          });
        }
      },
    );

    return () => controller.abort();
  }, [requestKey]);

  async function removeCampaign(campaignId: string) {
    if (removingId) return;

    setRemovingId(campaignId);

    try {
      await removeFromWatchlist(campaignId);

      setFeed((current) => {
        if (current.requestKey !== requestKey) return current;

        return {
          ...current,
          items: current.items.filter(
            (item) => item.campaign._id !== campaignId,
          ),
        };
      });
    } catch (requestError) {
      setFeed((current) => ({
        ...current,
        error:
          requestError instanceof Error
            ? requestError.message
            : "Could not remove this campaign.",
      }));
    } finally {
      setRemovingId(null);
    }
  }

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/marketplace"
              className="text-sm font-semibold text-[#047857]"
            >
              Back to marketplace
            </Link>
            <h1 className="mt-3 text-3xl font-bold">My Watchlist</h1>
            <p className="mt-2 text-sm text-[#526B82]">
              Saved campaigns always show their current status and funding progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            className="rounded-lg border border-[#D9E2EC] bg-white px-4 py-2 text-sm font-bold"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <p role="status" className="mt-8 text-sm text-[#526B82]">
            Loading your watchlist…
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#BCCCDC] bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold">Your watchlist is empty</h2>
            <p className="mt-2 text-sm text-[#627D98]">
              Save active or funded campaigns from the marketplace to follow them.
            </p>
            <Link
              to="/marketplace"
              className="mt-5 inline-block rounded-lg bg-[#059669] px-4 py-2 text-sm font-bold text-white"
            >
              Explore campaigns
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-8 grid gap-5">
            {items.map((item) => {
              const campaign = item.campaign;
              const progress = Math.round(campaign.fundingProgress * 100);
              const publicCampaign =
                campaign.status === "active" || campaign.status === "funded";

              return (
                <article
                  key={item._id}
                  className="rounded-2xl border border-[#DCE5EB] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#047857]">
                        {campaign.status.replaceAll("_", " ")}
                      </p>
                      <h2 className="mt-2 text-xl font-bold">{campaign.title}</h2>
                      {campaign.businessSnapshot && (
                        <p className="mt-1 text-sm text-[#526B82]">
                          {campaign.businessSnapshot.name} ·{" "}
                          {campaign.businessSnapshot.district}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={removingId === campaign._id}
                      onClick={() => removeCampaign(campaign._id)}
                      className="rounded-lg border border-[#FCA5A5] px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
                    >
                      {removingId === campaign._id ? "Removing…" : "Remove"}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 border-y border-[#E8EEF2] py-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-[#627D98]">Virtual target</p>
                      <p className="mt-1 font-bold">
                        {formatTaka(campaign.fundingTarget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#627D98]">Units remaining</p>
                      <p className="mt-1 font-bold">
                        {campaign.remainingUnits.toLocaleString("en-BD")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#627D98]">Funding progress</p>
                      <p className="mt-1 font-bold text-[#047857]">
                        {progress}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-[#627D98]">
                      Saved on{" "}
                      {new Date(item.savedAt).toLocaleDateString("en-BD")}
                    </p>

                    {publicCampaign && (
                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="text-sm font-bold text-[#047857]"
                      >
                        View campaign
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}