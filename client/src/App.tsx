import { useState, type ReactNode } from "react";

type IconProps = { className?: string };

const ArrowRight = ({ className = "h-5 w-5" }: IconProps) => (
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

const Check = ({ className = "h-5 w-5" }: IconProps) => (
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

const Search = ({ className = "h-6 w-6" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m16 16 4 4" />
  </svg>
);

const PieChart = ({ className = "h-6 w-6" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3a9 9 0 1 0 9 9h-9V3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3.9A9 9 0 0 1 20.1 9H15V3.9Z" />
  </svg>
);

const TrendUp = ({ className = "h-6 w-6" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 17 6-6 4 4 6-8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h5v5" />
  </svg>
);

const Shield = ({ className = "h-5 w-5" }: IconProps) => (
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

const opportunities = [
  {
    name: "Shobuj Bazar",
    sector: "Grocery",
    location: "Dhaka",
    description: "Expanding a neighborhood grocery with a second community-focused location.",
    raised: "৳34,20,000",
    goal: "৳50,00,000",
    progress: 68,
    unit: "৳500",
    image:
      "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRlcGVuZGVudCUyMGdyb2NlcnklMjBzdG9yZSUyMGZyZXNoJTIwcHJvZHVjZSUyMGludGVyaW9yfGVufDF8fHx8MTc5NDY1NjM4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Nodi Bangla Kitchen",
    sector: "Restaurant",
    location: "Chattogram",
    description: "A regional Bangladeshi restaurant growing its catering operation.",
    raised: "৳25,00,000",
    goal: "৳48,00,000",
    progress: 52,
    unit: "৳1,000",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXN0YXVyYW50JTIwc21hbGwlMjBidXNpbmVzcyUyMGludGVyaW9yfGVufDF8fHx8MTc5NDY1NjM4OHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Sylhet Oven",
    sector: "Bakery",
    location: "Sylhet",
    description: "Scaling artisan production with a new energy-efficient bakehouse.",
    raised: "৳14,60,000",
    goal: "৳22,50,000",
    progress: 65,
    unit: "৳500",
    image:
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXJzJTIwc2hvcCUyMHJlc3RhdXJhbnQlMjBiYWtlcnklMjByZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3OTQ2NTYzODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Karu Loom Studio",
    sector: "Clothing",
    location: "Gazipur",
    description: "Growing a responsibly sourced apparel label and local production workshop.",
    raised: "৳27,50,000",
    goal: "৳60,00,000",
    progress: 46,
    unit: "৳1,000",
    image:
      "https://images.unsplash.com/photo-1573612664822-d7d347da7b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGNsb3RoaW5nJTIwZmFzaGlvbiUyMHN0dWRpbyUyMHNtYWxsJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzk0NjU2Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Padma Poultry Farm",
    sector: "Poultry",
    location: "Rajshahi",
    description: "Modernizing a family-run free-range poultry and distribution farm.",
    raised: "৳18,90,000",
    goal: "৳30,00,000",
    progress: 63,
    unit: "৳500",
    image:
      "https://images.unsplash.com/photo-1715034076526-79a3241d046d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVlJTIwcmFuZ2UlMjBwb3VsdHJ5JTIwZmFybSUyMGNoaWNrZW5zfGVufDF8fHx8MTc5NDY1NjM4OXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Shurjo Community Energy",
    sector: "Renewable Energy",
    location: "Chattogram",
    description: "Building a shared solar installation for local commercial spaces.",
    raised: "৳62,40,000",
    goal: "৳90,00,000",
    progress: 69,
    unit: "৳2,000",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMGVuZXJneSUyMGZhcm0lMjBwYW5lbHMlMjBidXNpbmVzc3xlbnwxfHx8fDE3OTQ2NTYzODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#top" className="inline-flex items-center gap-2.5" aria-label="FundTogether home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#059669] shadow-[0_6px_18px_rgba(5,150,105,.22)]">
        <span className="absolute left-[9px] h-[18px] w-[7px] rounded-[3px] bg-white/85 -rotate-12" />
        <span className="absolute right-[9px] h-[18px] w-[7px] rounded-[3px] bg-white rotate-12" />
      </span>
      <span
        className={`text-[19px] font-bold tracking-[-0.04em] ${inverse ? "text-white" : "text-[#102A43]"}`}
      >
        Fund<span className="text-[#059669]">Together</span>
      </span>
    </a>
  );
}

function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "light";
  className?: string;
}) {
  const styles = {
    primary: "bg-[#059669] text-white shadow-[0_10px_24px_rgba(5,150,105,.2)] hover:bg-[#047857]",
    secondary:
      "border border-[#CBD5E1] bg-white text-[#102A43] hover:border-[#94A3B8] hover:bg-[#F8FAFC]",
    light: "bg-white text-[#102A43] shadow-[0_10px_28px_rgba(7,30,53,.16)] hover:bg-[#F0FDF8]",
  };
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

function OpportunityCard({ item }: { item: (typeof opportunities)[number] }) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#E3EAF0] bg-white shadow-[0_6px_24px_rgba(16,42,67,.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(16,42,67,.11)]">
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image}
          alt={`${item.name} business`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#102A43]/35 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#102A43] shadow-sm backdrop-blur">
          {item.sector}
        </span>
      </div>
      <div className="p-5">
        <p className="mb-1 text-xs font-medium text-[#64748B]">{item.location}</p>
        <h3 className="text-[19px] font-bold tracking-[-0.02em] text-[#102A43]">{item.name}</h3>
        <p className="mt-2.5 min-h-[44px] text-[13px] leading-[1.65] text-[#64748B]">
          {item.description}
        </p>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#64748B]">
              Illustrative Simulated Investment
            </p>
            <p className="mt-0.5 text-[15px] font-bold text-[#102A43]">
              {item.raised} <span className="font-medium text-[#94A3B8]">of {item.goal}</span>
            </p>
          </div>
          <span className="text-sm font-bold text-[#059669]">{item.progress}%</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E8EEF2]">
          <div
            className="h-full rounded-full bg-[#059669]"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[#EDF1F5] pt-4">
          <p className="text-xs text-[#64748B]">
            Simulated units from <span className="font-bold text-[#102A43]">{item.unit}</span>
          </p>
          <a
            href="#disclaimer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:text-[#047857]"
          >
            View demo campaign <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-white text-[#102A43]">
      <header className="relative z-50 border-b border-[#E7EDF2] bg-white/95 backdrop-blur">
        <div className="page-container flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary navigation">
            <a href="/marketplace" className="nav-link inline-flex items-center gap-1.5">
              Explore <ChevronDown />
            </a>
            <a href="#how-it-works" className="nav-link">
              How It Works
            </a>
            <a href="#about" className="nav-link">
              About
            </a>
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href="#disclaimer"
              className="text-sm font-semibold text-[#334E68] transition-colors hover:text-[#059669]"
            >
              Log in
            </a>
            <Button href="#opportunities" className="min-h-10 px-5">
              Get Started
            </Button>
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
                ["How It Works", "#how-it-works"],
                ["About", "#about"],
                ["Log in", "#disclaimer"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-[#F4F8FA]"
                >
                  {label}
                </a>
              ))}
              <Button href="#opportunities" className="mt-3">
                Get Started
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="hero-grid relative overflow-hidden bg-[#F7FAFC]">
          <div className="absolute -right-20 top-10 h-[460px] w-[460px] rounded-full bg-[#DDF6EC]/60 blur-3xl" />
          <div className="page-container relative grid min-h-[690px] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-24">
            <div className="max-w-[650px]">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#CDEEE1] bg-[#EDFBF6] px-3.5 py-2 text-xs font-semibold text-[#047857]">
                <span className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />
                A clearer way to discover growing businesses
              </div>
              <h1 className="max-w-[640px] text-[48px] font-bold leading-[1.06] tracking-[-0.055em] text-[#102A43] sm:text-[60px] lg:text-[68px]">
                Big opportunities. <span className="text-[#059669]">Smaller investments.</span>
              </h1>
              <p className="mt-7 max-w-[590px] text-[17px] leading-[1.75] text-[#526B82]">
                Explore demonstration business campaigns and discover how fractional units make
                business investment concepts more accessible through a virtual balance, without
                transferring real money.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/marketplace">
                  Explore Opportunities <ArrowRight />
                </Button>
                <Button href="#raise-funding" variant="secondary">
                  Raise Funding
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-[#526B82]">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#059669]" /> Curated demo campaigns
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#059669]" /> Virtual Balance
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#059669]" /> No real transactions
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
              <div className="absolute -left-9 top-16 h-28 w-28 rounded-full border border-[#BDE6D8]" />
              <div className="absolute -bottom-7 -right-7 h-44 w-44 rounded-[32px] bg-[#D9F3EA]" />
              <article className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white p-3 shadow-[0_28px_70px_rgba(16,42,67,.16)]">
                <div className="relative h-[300px] overflow-hidden rounded-[19px] sm:h-[330px]">
                  <img
                    src="https://images.unsplash.com/photo-1692826090383-b793a5e4e81c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYW5nbGFkZXNoJTIwcmVzdGF1cmFudCUyMHNtYWxsJTIwYnVzaW5lc3MlMjBEaGFrYSUyMGludGVyaW9yJTIwb3duZXJ8ZW58MXx8fHwxNzk0NjU2Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Traditional Bangladeshi restaurant serving pots"
                    className="h-full w-full object-cover brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/65 via-[#102A43]/10 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-[#047857] shadow-sm">
                    <Shield className="h-4 w-4" /> Demonstration campaign
                  </span>
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="text-xs font-medium text-white/85">
                      Illustrative featured opportunity
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">
                      Nodi Bangla Kitchen
                    </h2>
                    <p className="mt-1 text-xs text-white/80">Restaurant · Dhaka</p>
                  </div>
                </div>
                <div className="px-4 pb-5 pt-6 sm:px-6 sm:pb-6">
                  <div className="flex items-start justify-between gap-4 sm:gap-5">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#64748B]">
                        Illustrative Simulated Investment progress
                      </p>
                      <p className="mt-1 text-lg font-bold tracking-[-0.03em] text-[#102A43] sm:text-xl">
                        ৳25,00,000{" "}
                        <span className="text-sm font-medium text-[#94A3B8]">of ৳48,00,000</span>
                      </p>
                    </div>
                    <p className="text-lg font-bold text-[#059669]">52%</p>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E7EDF2]">
                    <div className="h-full w-[52%] rounded-full bg-[#059669]" />
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[#E8EEF2] pt-5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[.08em] text-[#94A3B8]">
                        Simulated unit
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[#102A43]">From ৳1,000</p>
                    </div>
                    <a
                      href="#disclaimer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#102A43] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#183B56]"
                    >
                      View demo campaign <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
              <div className="relative z-10 mt-4 ml-auto flex w-full items-center gap-3 rounded-xl border border-[#DDE6EC] bg-white px-4 py-3 shadow-[0_14px_32px_rgba(16,42,67,.14)] sm:w-fit">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#E7F8F1] text-[#059669]">
                  <PieChart className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] text-[#64748B]">Simulated campaign momentum</p>
                  <p className="text-xs font-bold text-[#102A43]">Demonstration only</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#E7EDF2] bg-white">
          <div className="page-container pt-7 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#829AB1]">
              Illustrative demonstration data · No real funding activity
            </p>
          </div>
          <div className="page-container grid grid-cols-2 pb-9 pt-4 lg:grid-cols-4">
            {[
              ["24", "Sample campaigns"],
              ["৳8,40,00,000", "Illustrative campaign goals"],
              ["6", "Demonstration sectors"],
              ["100%", "Simulated Investment"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`px-4 py-4 text-center lg:px-8 ${index > 0 ? "border-l border-[#E7EDF2]" : ""} ${index === 2 ? "max-lg:border-l-0" : ""}`}
              >
                <p className="text-[20px] font-bold tracking-[-0.04em] text-[#102A43] sm:text-[27px] lg:text-[30px]">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium text-[#64748B] sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="opportunities" className="scroll-mt-20 bg-[#F8FAFC] py-24">
          <div className="page-container">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Curated opportunities</p>
                <h2 className="section-title mt-3">Businesses worth discovering</h2>
                <p className="mt-4 max-w-[610px] text-[15px] leading-7 text-[#64748B]">
                  Explore Bangladesh-based demonstration campaigns across essential industries, each
                  presented with clear business goals and illustrative progress.
                </p>
              </div>
              <a
                href="#disclaimer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#059669] hover:text-[#047857]"
              >
                View all opportunities <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((item) => (
                <OpportunityCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-white py-24">
          <div className="page-container">
            <div className="mx-auto max-w-[650px] text-center">
              <p className="eyebrow">Simple by design</p>
              <h2 className="section-title mt-3">How FundTogether works</h2>
              <p className="mt-4 text-[15px] leading-7 text-[#64748B]">
                Learn how to evaluate opportunities and build a Simulated Investment portfolio using
                a Virtual Balance.
              </p>
            </div>
            <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-[#B8C8D5] lg:block" />
              {[
                {
                  icon: <Search />,
                  number: "01",
                  title: "Explore sample businesses",
                  text: "Browse demonstration campaigns by sector, goal and unit size, with essential information presented clearly.",
                },
                {
                  icon: <PieChart />,
                  number: "02",
                  title: "Use your Virtual Balance",
                  text: "Choose fractional units using a Virtual Balance. No real money is deposited or transferred.",
                },
                {
                  icon: <TrendUp />,
                  number: "03",
                  title: "Track Simulated Investments",
                  text: "Follow illustrative campaign progress and understand how your simulated selections change over time.",
                },
              ].map((step) => (
                <article
                  key={step.number}
                  className="relative z-10 rounded-[20px] border border-[#E3EAF0] bg-white p-8 text-center shadow-[0_8px_26px_rgba(16,42,67,.05)]"
                >
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-8 border-white bg-[#E8F8F2] text-[#059669] shadow-[0_5px_18px_rgba(16,42,67,.08)]">
                    {step.icon}
                  </div>
                  <p className="mt-6 text-[11px] font-bold uppercase tracking-[.14em] text-[#059669]">
                    Step {step.number}
                  </p>
                  <h3 className="mt-2 text-lg font-bold tracking-[-0.02em] text-[#102A43]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#64748B]">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-[#F2F7F9] py-24">
          <div className="page-container grid items-center gap-14 lg:grid-cols-2">
            <div className="relative">
              <div className="overflow-hidden rounded-[24px] shadow-[0_24px_55px_rgba(16,42,67,.14)]">
                <img
                  src="https://images.unsplash.com/photo-1587241321921-91a834d6d191?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzbWFsbCUyMGJ1c2luZXNzJTIwb3duZXJzJTIwc2hvcCUyMHJlc3RhdXJhbnQlMjBiYWtlcnklMjByZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3OTQ2NTYzODN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Independent business owner in his shop"
                  className="h-[460px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 max-w-[235px] rounded-2xl border border-white bg-white p-5 shadow-[0_16px_38px_rgba(16,42,67,.15)] sm:right-8">
                <p className="text-3xl font-bold tracking-[-0.04em] text-[#059669]">From ৳500</p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Fractional units make exploring business opportunities more approachable.
                </p>
              </div>
            </div>
            <div className="lg:pl-8">
              <p className="eyebrow">Built for shared growth</p>
              <h2 className="section-title mt-3">
                Making Business Investment More Accessible to Everyone
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-[#526B82]">
                FundTogether introduces curious individuals to sample Bangladesh-based businesses
                through transparent campaign stories and fractional simulations.
              </p>
              <div className="mt-7 space-y-5">
                {[
                  [
                    "Transparent campaign information",
                    "Review illustrative business goals, use of funds and simulated progress in one clear place.",
                  ],
                  [
                    "Opportunities across diverse business sectors",
                    "Discover demonstration businesses across food, retail, clothing, poultry, energy and more.",
                  ],
                  [
                    "Risk-free simulated investment experience",
                    "Explore investment concepts with a Virtual Balance. No real money is deposited or transferred.",
                  ],
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-4">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#DDF6EC] text-[#059669]">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#102A43]">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#64748B]">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="raise-funding" className="scroll-mt-20 bg-white py-24">
          <div className="page-container">
            <div className="cta-pattern relative overflow-hidden rounded-[28px] bg-[#102A43] px-7 py-14 sm:px-14 lg:px-20 lg:py-16">
              <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[55px] border-white/[.035]" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                <div className="max-w-[720px]">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5EE0B5]">
                    For founders and operators
                  </p>
                  <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-[40px]">
                    Ready to fund your next chapter?
                  </h2>
                  <p className="mt-4 max-w-[650px] text-[15px] leading-7 text-[#B7C9D8]">
                    Prepare a demonstration campaign, outline your goals and show how your business
                    story could be presented to an interested community.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#D8E5EE]">
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#5EE0B5]" /> Guided application
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#5EE0B5]" /> Demo campaign screening
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#5EE0B5]" /> Clear presentation
                    </span>
                  </div>
                </div>
                <Button href="#disclaimer" variant="light" className="w-fit">
                  Start your application <ArrowRight />
                </Button>
              </div>
            </div>
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
                <h3 className="text-sm font-bold text-white">{heading}</h3>
                <ul className="mt-5 space-y-3.5">
                  {(links as string[]).map((link) => (
                    <li key={link}>
                      <a href="#disclaimer" className="text-sm transition-colors hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div id="disclaimer" className="scroll-mt-20 border-b border-white/10 py-6">
            <div className="flex items-start gap-3 rounded-xl bg-white/[.04] px-4 py-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#5EE0B5]" />
              <p className="text-[11px] leading-5 text-[#92A9BA]">
                <strong className="font-semibold text-[#C8D6E0]">Simulation notice:</strong>{" "}
                FundTogether is a demonstration platform for educational exploration. No real
                investments, banking integrations, financial transactions, guaranteed returns or
                guaranteed business verification are offered. All campaigns, Virtual Balances,
                progress and BDT amounts shown are illustrative, and no real money is transferred.
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
