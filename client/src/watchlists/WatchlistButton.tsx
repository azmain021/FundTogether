type WatchlistButtonProps = {
  campaignId: string;
  saved: boolean;
  pending: boolean;
  disabled?: boolean;
  onToggle: (campaignId: string) => void;
};

export default function WatchlistButton({
  campaignId,
  saved,
  pending,
  disabled = false,
  onToggle,
}: WatchlistButtonProps) {
  const label = saved ? "Remove from watchlist" : "Save to watchlist";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={saved}
      title={label}
      disabled={disabled || pending}
      onClick={() => onToggle(campaignId)}
      className={`grid h-9 w-9 place-items-center rounded-full border text-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
        saved
          ? "border-[#047857] bg-[#ECFDF5] text-[#047857]"
          : "border-[#D9E2EC] bg-white text-[#526B82] hover:border-[#059669] hover:text-[#047857]"
      }`}
    >
      {pending ? "…" : saved ? "♥" : "♡"}
    </button>
  );
}