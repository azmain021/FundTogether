import { useEffect, useState } from "react";
import {
  addToWatchlist,
  listWatchlist,
  removeFromWatchlist,
} from "../api/watchlists";
import { useSession } from "../auth/session";

type WatchlistState = {
  investorId: string | null;
  campaignIds: Set<string>;
};

export function useWatchlist() {
  const { user } = useSession();
  const investorId = user?.role === "investor" ? user.id : null;

  const [state, setState] = useState<WatchlistState>({
    investorId: null,
    campaignIds: new Set<string>(),
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const ready = !investorId || state.investorId === investorId;

  function isSaved(campaignId: string) {
    return state.investorId === investorId && state.campaignIds.has(campaignId);
  }

  useEffect(() => {
    if (!investorId) return;

    const controller = new AbortController();

    listWatchlist(controller.signal).then(
      (items) => {
        if (!controller.signal.aborted) {
          setState({
            investorId,
            campaignIds: new Set(items.map((item) => item.campaign._id)),
          });
          setError("");
        }
      },
      (requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load your watchlist.",
          );
        }
      },
    );

    return () => controller.abort();
  }, [investorId]);

  async function toggle(campaignId: string) {
    if (!investorId || !ready || updatingId) return;

    const currentlySaved = isSaved(campaignId);
    setUpdatingId(campaignId);
    setError("");

    try {
      if (currentlySaved) {
        await removeFromWatchlist(campaignId);
      } else {
        await addToWatchlist(campaignId);
      }

      setState((current) => {
        if (current.investorId !== investorId) return current;

        const campaignIds = new Set(current.campaignIds);

        if (currentlySaved) {
          campaignIds.delete(campaignId);
        } else {
          campaignIds.add(campaignId);
        }

        return {
          investorId,
          campaignIds,
        };
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update your watchlist.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return {
    enabled: Boolean(investorId),
    ready,
    error,
    updatingId,
    isSaved,
    toggle,
  };
}