import { useState, type FormEvent } from "react";
import { registerBusinessOwner } from "./api/auth";
import { ApiError } from "./api/client";

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

const Eye = ({ hidden, className = "h-5 w-5" }: IconProps & { hidden: boolean }) => (
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
      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
    />
    <circle cx="12" cy="12" r="2.5" />
    {hidden && <path strokeLinecap="round" d="m4 4 16 16" />}
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

const steps = [
  {
    number: "01",
    short: "Account",
    title: "Account Registration",
    description: "Create your secure owner account.",
  },
  {
    number: "02",
    short: "Profile",
    title: "Business Profile",
    description: "Tell us about your business.",
  },
  {
    number: "03",
    short: "Documents",
    title: "Document Submission",
    description: "Share supporting information.",
  },
  {
    number: "04",
    short: "Campaign",
    title: "Campaign Creation",
    description: "Prepare your simulation campaign.",
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

function TextField({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-bold text-[#334E68]">{label}</span>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
      />
    </label>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-bold text-[#334E68]">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className="h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 pr-12 text-sm text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#829AB1] transition-colors hover:text-[#526B82]"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <Eye hidden={visible} />
        </button>
      </span>
    </label>
  );
}

export default function BusinessRegistration() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [registered, setRegistered] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setHasError(false);
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || registered) return;
    if (form.password !== form.confirmPassword) {
      setHasError(true);
      setMessage("Your password and confirmation do not match.");
      return;
    }
    if (!acceptedTerms) {
      setHasError(true);
      setMessage("Please accept the terms and conditions to continue.");
      return;
    }
    setHasError(false);
    setMessage("");
    setSaving(true);
    try {
      const account = await registerBusinessOwner({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        acceptedTerms,
      });
      setRegistered(true);
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setMessage(`Your business owner account for ${account.email} has been created. Log in to set up your business profile.`);
    } catch (error: unknown) {
      setHasError(true);
      setMessage(
        error instanceof ApiError && error.details.length > 0
          ? error.details.join(" ")
          : error instanceof Error
            ? error.message
            : "Could not create your account. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#102A43]">
      <header className="relative z-50 border-b border-[#E7EDF2] bg-white/95 backdrop-blur">
        <div className="page-container flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary navigation">
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
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href="/login"
              className="text-sm font-semibold text-[#334E68] transition-colors hover:text-[#059669]"
            >
              Log in
            </a>
            <a
              href="/"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 text-sm font-semibold text-[#102A43] transition hover:bg-[#F8FAFC]"
            >
              <ArrowLeft /> Back to Home
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
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex max-w-[1240px] flex-col gap-1">
              {[
                ["Explore", "/marketplace"],
                ["How It Works", "/#how-it-works"],
                ["About", "/#about"],
                ["Back to Home", "/"],
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
          <div className="page-container py-10 text-center sm:py-12">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#059669]">
              Business owner onboarding
            </p>
            <h1 className="mt-3 text-[36px] font-bold leading-tight tracking-[-0.045em] text-[#102A43] sm:text-[44px]">
              Create Your Business Owner Account
            </h1>
            <p className="mx-auto mt-4 max-w-[650px] text-[15px] leading-7 text-[#526B82]">
              Create a business owner profile and learn how eligible businesses can apply to build
              simulated funding campaigns on FundTogether.
            </p>
            <p className="mx-auto mt-2 max-w-[600px] text-[11px] leading-5 text-[#829AB1]">
              Create your account first. You will add your business details in the next step.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="page-container">
            <div className="mb-8 grid grid-cols-4 overflow-hidden rounded-2xl border border-[#DCE5EB] bg-white shadow-[0_6px_22px_rgba(16,42,67,.05)] lg:hidden">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`relative px-2 py-4 text-center ${index === 0 ? "bg-[#ECFDF5]" : ""}`}
                >
                  <span
                    className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${index === 0 ? "bg-[#059669] text-white" : "bg-[#EDF2F7] text-[#829AB1]"}`}
                  >
                    {step.number}
                  </span>
                  <p
                    className={`mt-2 text-[9px] font-bold sm:text-[10px] ${index === 0 ? "text-[#047857]" : "text-[#829AB1]"}`}
                  >
                    {step.short}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid overflow-hidden rounded-[24px] border border-[#DCE5EB] bg-white shadow-[0_18px_50px_rgba(16,42,67,.09)] lg:grid-cols-[360px_1fr]">
              <aside className="relative hidden overflow-hidden bg-[#102A43] p-10 text-white lg:block">
                <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full border-[44px] border-white/[.035]" />
                <div className="absolute -right-20 top-28 h-48 w-48 rounded-full bg-[#059669]/10 blur-2xl" />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5EE0B5]">
                    Your application journey
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                    Four clear steps to your campaign
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#B7C9D8]">
                    Start with your account details, then build your demonstration business profile
                    at your own pace.
                  </p>
                  <div className="mt-10">
                    {steps.map((step, index) => (
                      <div key={step.number} className="relative flex gap-4 pb-8 last:pb-0">
                        {index < steps.length - 1 && (
                          <span className="absolute bottom-0 left-[17px] top-9 w-px bg-white/15" />
                        )}
                        <span
                          className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${index === 0 ? "border-[#5EE0B5] bg-[#059669] text-white" : "border-white/20 bg-white/[.06] text-[#92A9BA]"}`}
                        >
                          {step.number}
                        </span>
                        <div>
                          <p
                            className={`text-sm font-bold ${index === 0 ? "text-white" : "text-[#B7C9D8]"}`}
                          >
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#7F9AAE]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="p-6 sm:p-9 lg:p-12">
                <div className="flex flex-col justify-between gap-3 border-b border-[#E3EAF0] pb-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#059669]">
                      Step 1 of 4
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#102A43]">
                      Account Registration
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#829AB1]">All fields are required</p>
                </div>

                <form onSubmit={submitRegistration} className="mt-7" aria-busy={saving}>
                  <fieldset disabled={saving || registered} className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    <TextField
                      id="full-name"
                      label="Full name"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(value) => updateField("fullName", value)}
                    />
                    <TextField
                      id="email"
                      label="Email address"
                      type="email"
                      autoComplete="email"
                      placeholder="name@business.com"
                      value={form.email}
                      onChange={(value) => updateField("email", value)}
                    />
                    <TextField
                      id="phone"
                      label="Phone number"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={form.phone}
                      onChange={(value) => updateField("phone", value)}
                    />
                    <PasswordField
                      id="password"
                      label="Password"
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={(value) => updateField("password", value)}
                    />
                    <PasswordField
                      id="confirm-password"
                      label="Confirm password"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={(value) => updateField("confirmPassword", value)}
                    />
                  </fieldset>

                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#E3EAF0] bg-[#F8FAFC] p-4">
                    <input
                      type="checkbox"
                      disabled={saving || registered}
                      checked={acceptedTerms}
                      onChange={(event) => {
                        setAcceptedTerms(event.target.checked);
                        setMessage("");
                        setHasError(false);
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-[#BCCCDC] accent-[#059669]"
                    />
                    <span className="text-xs leading-5 text-[#526B82]">
                      I agree to the{" "}
                      <a href="#registration-notice" className="font-bold text-[#059669]">
                        Terms and Conditions
                      </a>{" "}
                      and acknowledge that all funding activity on FundTogether is simulated.
                    </span>
                  </label>

                  {message && (
                    <div
                      className={`mt-5 rounded-xl border p-4 text-xs font-semibold leading-5 ${hasError ? "border-[#F3C7C7] bg-[#FFF5F5] text-[#B42318]" : "border-[#BDE8D9] bg-[#ECFDF5] text-[#047857]"}`}
                      role={hasError ? "alert" : "status"}
                      aria-live="polite"
                    >
                      <div className="flex gap-2.5">
                        {!hasError && <ShieldCheck className="h-4 w-4 shrink-0" />}
                        <p>{message}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving || registered}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(5,150,105,.2)] transition hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving ? "Creating Account…" : registered ? "Account Created" : "Create Account"} <ArrowRight />
                  </button>
                  {registered && (
                    <a
                      href="/login?registered=1&next=%2Fbusiness%2Fprofile"
                      className="mt-4 flex items-center gap-2 text-sm font-bold text-[#059669]"
                    >
                      Log in to Continue <ArrowRight />
                    </a>
                  )}
                  <p id="existing-user" className="mt-6 text-sm text-[#627D98]">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="font-bold text-[#059669] hover:text-[#047857]"
                    >
                      Log in
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B2135] text-[#B7C9D8]">
        <div className="page-container">
          <div
            id="registration-notice"
            className="scroll-mt-20 flex flex-col justify-between gap-6 border-b border-white/10 py-8 md:flex-row md:items-center"
          >
            <div>
              <Logo inverse />
              <p className="mt-3 max-w-[430px] text-xs leading-5 text-[#92A9BA]">
                A transparent, educational simulation platform for exploring business funding
                concepts.
              </p>
            </div>
            <div className="max-w-[560px] rounded-xl bg-white/[.04] px-4 py-3">
              <p className="text-[10px] leading-5 text-[#92A9BA]">
                <strong className="font-semibold text-[#C8D6E0]">Registration notice:</strong> This
                form creates a business owner account. Your password is stored as a hash. Business
                verification is a separate step, and all funding activity is simulated.
              </p>
            </div>
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
