
import { useState, type ReactNode } from "react";

type IconProps = { className?: string };

const Clock = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

const Check = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
  </svg>
);

const Lock = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    aria-hidden="true"
  >
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const DocumentIcon = ({ className = "h-5 w-5" }: IconProps) => (
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
      d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6M9 17h5" />
  </svg>
);

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

const documents = [
  { name: "Trade License", status: "Submitted", submitted: true },
  { name: "TIN Certificate", status: "Optional / Not Submitted", submitted: false },
  { name: "Business Owner's National ID", status: "Submitted", submitted: true },
  { name: "Business Address Proof", status: "Submitted", submitted: true },
  { name: "Additional Supporting Documents", status: "Optional / Not Submitted", submitted: false },
];

const progressStages = [
  { title: "Account Registration", status: "Completed", state: "completed" },
  { title: "Business Profile", status: "Completed", state: "completed" },
  { title: "Document Submission", status: "Completed", state: "completed" },
  { title: "Admin Review", status: "Pending", state: "pending" },
  { title: "Campaign Creation", status: "Locked until approval", state: "locked" },
] as const;

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

function Surface({
  title,
  children,
  id,
  className = "",
}: {
  title: string;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-[20px] border border-[#E3EAF0] bg-white p-6 shadow-[0_6px_24px_rgba(16,42,67,.05)] sm:p-7 ${className}`}
    >
      <h2 className="text-xl font-bold tracking-[-0.025em] text-[#102A43]">{title}</h2>
      {children}
    </section>
  );
}

export default function DocumentReviewStatus() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="relative z-50 border-b border-[#E7EDF2] bg-white/95 backdrop-blur">
        <div className="page-container flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            <a
              href="#application-status"
              className="text-sm font-bold text-[#059669]"
              aria-current="page"
            >
              Dashboard
            </a>
            <a href="/marketplace" className="nav-link">
              Explore
            </a>
            <a href="/#how-it-works" className="nav-link">
              How It Works
            </a>
            <a href="/#about" className="nav-link">
              About
            </a>
          </nav>
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="inline-flex h-11 items-center gap-3 rounded-xl border border-[#D9E2EC] bg-white px-3 text-left transition hover:bg-[#F8FAFC]"
              aria-expanded={profileOpen}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#DDF6EC] text-[10px] font-bold text-[#047857]">
                SB
              </span>
              <span>
                <span className="block text-xs font-bold text-[#102A43]">Shobuj Bazar</span>
                <span className="block text-[9px] text-[#829AB1]">Business Owner</span>
              </span>
              <ChevronDown className="h-4 w-4 text-[#829AB1]" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-13 w-52 rounded-xl border border-[#E3EAF0] bg-white p-2 shadow-[0_14px_35px_rgba(16,42,67,.14)]">
                <a
                  href="/business/profile"
                  className="block rounded-lg px-3 py-2.5 text-xs font-semibold text-[#334E68] hover:bg-[#F4F8FA]"
                >
                  Business Profile
                </a>
                <a
                  href="/business/documents"
                  className="block rounded-lg px-3 py-2.5 text-xs font-semibold text-[#334E68] hover:bg-[#F4F8FA]"
                >
                  Submitted Documents
                </a>
                <a
                  href="/"
                  className="block rounded-lg px-3 py-2.5 text-xs font-semibold text-[#334E68] hover:bg-[#F4F8FA]"
                >
                  Sign out
                </a>
              </div>
            )}
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
                ["Dashboard", "#application-status"],
                ["Explore", "/marketplace"],
                ["How It Works", "/#how-it-works"],
                ["About", "/#about"],
                ["Business Profile", "/business/profile"],
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
          <div className="page-container py-10 sm:py-12">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#059669]">
              Business dashboard
            </p>
            <h1 className="mt-3 text-[34px] font-bold leading-tight tracking-[-0.045em] text-[#102A43] sm:text-[42px]">
              Your Documents Are Under Review
            </h1>
            <p className="mt-4 max-w-[820px] text-[15px] leading-7 text-[#526B82]">
              Thank you for submitting your business documents. Our review team will examine your
              information before you can create an investment campaign.
            </p>
            <p className="mt-2 text-[11px] leading-5 text-[#829AB1]">
              This page displays illustrative workflow data for a simulated educational platform.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="page-container space-y-8">
            <section
              id="application-status"
              className="scroll-mt-24 overflow-hidden rounded-[22px] border border-[#F0D58A] bg-white shadow-[0_12px_36px_rgba(16,42,67,.08)]"
            >
              <div className="border-b border-[#F4E3B4] bg-[#FFFBEB] px-6 py-4 sm:px-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#9A6700]">
                  <Clock className="h-4 w-4" /> Pending Admin Review
                </span>
              </div>
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#102A43]">
                    Your application is awaiting approval
                  </h2>
                  <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#526B82]">
                    Your submitted business documents are waiting for administrator review. You will
                    be able to create a campaign once your business is approved.
                  </p>
                  <p className="mt-3 text-[11px] leading-5 text-[#829AB1]">
                    Pending status is illustrative and does not represent an actual administrator
                    review.
                  </p>
                </div>
                <div className="grid min-w-[250px] grid-cols-2 gap-4 rounded-xl border border-[#E3EAF0] bg-[#F8FAFC] p-4 lg:grid-cols-1">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#829AB1]">
                      Application reference
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#102A43]">FT-BIZ-2026-001</p>
                    <p className="mt-0.5 text-[9px] text-[#9FB3C8]">Illustrative reference only</p>
                  </div>
                  <div className="border-l border-[#E3EAF0] pl-4 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-4">
                    <p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#829AB1]">
                      Submission date
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#102A43]">14 November 2026</p>
                    <p className="mt-0.5 text-[9px] text-[#9FB3C8]">Illustrative date only</p>
                  </div>
                </div>
              </div>
            </section>

            <Surface title="Application Progress">
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {progressStages.map((stage, index) => (
                  <div
                    key={stage.title}
                    className={`relative rounded-xl border p-4 ${
                      stage.state === "pending"
                        ? "border-[#F0D58A] bg-[#FFFBEB]"
                        : stage.state === "locked"
                          ? "border-[#D9E2EC] bg-[#F3F6F8]"
                          : "border-[#CDEEE1] bg-[#F0FDF8]"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full ${
                        stage.state === "pending"
                          ? "bg-[#FEF3C7] text-[#9A6700]"
                          : stage.state === "locked"
                            ? "bg-[#E3E8EC] text-[#829AB1]"
                            : "bg-[#DDF6EC] text-[#047857]"
                      }`}
                    >
                      {stage.state === "pending" ? (
                        <Clock className="h-4 w-4" />
                      ) : stage.state === "locked" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Check />
                      )}
                    </span>
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[.07em] text-[#829AB1]">
                      Stage {index + 1}
                    </p>
                    <h3 className="mt-1 text-xs font-bold text-[#102A43]">{stage.title}</h3>
                    <p
                      className={`mt-1 text-[10px] font-semibold ${
                        stage.state === "pending"
                          ? "text-[#9A6700]"
                          : stage.state === "locked"
                            ? "text-[#829AB1]"
                            : "text-[#047857]"
                      }`}
                    >
                      {stage.status}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>

            <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr]">
              <Surface title="Submitted Documents" id="submitted-documents">
                <div className="mt-5 divide-y divide-[#E3EAF0]">
                  {documents.map((document) => (
                    <div
                      key={document.name}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EDF2F7] text-[#627D98]">
                          <DocumentIcon className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-semibold text-[#334E68]">{document.name}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-bold ${
                          document.submitted
                            ? "bg-[#EDF2F7] text-[#526B82]"
                            : "bg-[#F3F6F8] text-[#829AB1]"
                        }`}
                      >
                        {document.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Surface>

              <Surface title="What happens next?">
                <div className="mt-5 space-y-5">
                  {[
                    "An administrator reviews your submitted documents.",
                    "If approved, your business becomes eligible to create campaigns.",
                    "If rejected, you will see the reason and can correct the documents and resubmit them.",
                  ].map((text, index) => (
                    <div key={text} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E7F8F1] text-[10px] font-bold text-[#047857]">
                        {index + 1}
                      </span>
                      <p className="pt-0.5 text-sm leading-6 text-[#526B82]">{text}</p>
                    </div>
                  ))}
                </div>
              </Surface>
            </div>

            <section className="rounded-[20px] border border-[#D9E2EC] bg-[#F1F4F6] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#DDE3E7] text-[#627D98]">
                    <Lock />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-[#526B82]">Campaign Creation Locked</h2>
                    <p className="mt-2 max-w-[730px] text-sm leading-6 text-[#627D98]">
                      You cannot create or submit an investment campaign until an administrator
                      approves your business verification.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#CBD3D9] px-5 text-sm font-bold text-[#7B8D9A]"
                  aria-disabled="true"
                >
                  <Lock className="h-4 w-4" /> Create Campaign
                </button>
              </div>
            </section>

            <div className="flex flex-col justify-between gap-3 border-t border-[#DCE5EB] pt-6 sm:flex-row">
              <a
                href="#application-status"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-5 text-sm font-bold text-[#102A43] transition hover:bg-[#F8FAFC]"
              >
                <ArrowLeft /> Back to Dashboard
              </a>
              <a
                href="#submitted-documents"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#102A43] px-5 text-sm font-bold text-white transition hover:bg-[#183B56]"
              >
                View Submitted Documents <ArrowRight />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B2135] pt-14 text-[#B7C9D8]">
        <div className="page-container">
          <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
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
                        href="#status-notice"
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
          <div id="status-notice" className="border-b border-white/10 py-6">
            <p className="rounded-xl bg-white/[.04] px-4 py-3 text-[10px] leading-5 text-[#92A9BA]">
              <strong className="font-semibold text-[#C8D6E0]">Prototype notice:</strong>{" "}
              Application references, dates, document statuses and review progress are illustrative.
              No administrator review, verification or approval has taken place.
            </p>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 py-6 text-xs sm:flex-row">
            <p>© 2025 FundTogether. All rights reserved.</p>
            <p>Built for opportunity. Designed for clarity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
