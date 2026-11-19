import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ApiError } from "./api/client";
import { createBusiness, getMyBusiness, updateBusiness } from "./api/businesses";
import { useSession } from "./auth/session";
import AccountLinks from "./auth/AccountLinks";
import type {
  Business,
  BusinessInput,
  BusinessSector,
  BusinessSize,
  BusinessType,
} from "./api/types";

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

const StepCheck = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
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

type Option<T extends string> = { value: T; label: string };

const businessTypes: Option<BusinessType>[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_limited", label: "Private Limited Company" },
  { value: "cooperative", label: "Cooperative" },
  { value: "other", label: "Other" },
];

const sectors: Option<BusinessSector>[] = [
  { value: "grocery_retail", label: "Grocery / Retail" },
  { value: "restaurant_food", label: "Restaurant / Food" },
  { value: "bakery", label: "Bakery" },
  { value: "clothing_fashion", label: "Clothing / Fashion" },
  { value: "agriculture", label: "Agriculture / Poultry / Dairy / Fisheries" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "renewable_energy", label: "Renewable Energy" },
  { value: "transportation_delivery", label: "Transportation / Delivery" },
  { value: "other", label: "Other" },
];

const businessSizes: Option<BusinessSize>[] = [
  { value: "micro", label: "Micro Business" },
  { value: "small", label: "Small Business" },
  { value: "medium", label: "Medium Business" },
  { value: "large", label: "Large Business" },
];

const emptyForm = {
  officialName: "",
  businessType: "",
  sector: "",
  size: "",
  establishedYear: "",
  operatingHistory: "",
  division: "",
  district: "",
  address: "",
  description: "",
  employeeCount: "",
  website: "",
  businessEmail: "",
  contactPhone: "",
};

type ProfileForm = typeof emptyForm;

const toForm = (business: Business): ProfileForm => ({
  officialName: business.officialName,
  businessType: business.businessType,
  sector: business.sector,
  size: business.size,
  establishedYear: String(business.establishedYear),
  operatingHistory: business.operatingHistory ?? "",
  division: business.division,
  district: business.district,
  address: business.address,
  description: business.description,
  employeeCount: String(business.employeeCount),
  website: business.website ?? "",
  businessEmail: business.businessEmail,
  contactPhone: business.contactPhone,
});

const toInput = (form: ProfileForm): BusinessInput => ({
  officialName: form.officialName,
  businessType: form.businessType as BusinessType,
  sector: form.sector as BusinessSector,
  size: form.size as BusinessSize,
  establishedYear: Number(form.establishedYear),
  employeeCount: Number(form.employeeCount),
  division: form.division,
  district: form.district,
  address: form.address,
  description: form.description,
  businessEmail: form.businessEmail,
  contactPhone: form.contactPhone,
  operatingHistory: form.operatingHistory,
  website: form.website,
});

type Feedback = { tone: "success" | "error"; text: string; details?: string[] } | null;

const steps = [
  {
    number: "01",
    short: "Account",
    title: "Account Registration",
    description: "Your owner account details.",
    state: "complete",
  },
  {
    number: "02",
    short: "Profile",
    title: "Business Profile",
    description: "Tell us about your business.",
    state: "active",
  },
  {
    number: "03",
    short: "Documents",
    title: "Document Submission",
    description: "Share supporting information.",
    state: "inactive",
  },
  {
    number: "04",
    short: "Campaign",
    title: "Campaign Creation",
    description: "Prepare your simulation campaign.",
    state: "inactive",
  },
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

function FieldShell({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-2 block text-xs font-bold text-[#334E68]">{label}</span>
      {children}
    </label>
  );
}

function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = true,
  autoComplete,
  disabled = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <FieldShell id={id} label={label}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
      />
    </FieldShell>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: Option<string>[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <FieldShell id={id} label={label}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        disabled={disabled}
        className="h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#102A43] outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function StepMarker({ state, number }: { state: (typeof steps)[number]["state"]; number: string }) {
  if (state === "complete") {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#6ED5B0] bg-[#DDF6EC] text-[#047857]">
        <StepCheck />
      </span>
    );
  }

  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
        state === "active"
          ? "border-[#5EE0B5] bg-[#059669] text-white"
          : "border-white/20 bg-white/[.06] text-[#92A9BA]"
      }`}
    >
      {number}
    </span>
  );
}

export default function BusinessProfileSetup() {
  const { user } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<Business['verificationStatus']>('draft');
  const identityLocked = verificationStatus === 'pending' || verificationStatus === 'approved';
  const [saving, setSaving] = useState(false);

  // Reload a previously saved profile from the server (proves it persisted).
  useEffect(() => {
    const controller = new AbortController();
    getMyBusiness(controller.signal)
      .then((business) => {
        if (controller.signal.aborted) return;
        setBusinessId(business?._id ?? null);
        setVerificationStatus(business?.verificationStatus ?? 'draft');
        setForm(business ? toForm(business) : { ...emptyForm, businessEmail: user?.email ?? '', contactPhone: user?.phone ?? '' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadFailed(true);
        setFeedback({
          tone: "error",
          text: error instanceof Error ? error.message : "Could not load your saved profile.",
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user?.id, user?.email, user?.phone]);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || loading || loadFailed) return;
    setSaving(true);
    setFeedback(null);
    try {
      const input = toInput(form);
      const saved = businessId
        ? await updateBusiness(businessId, input)
        : await createBusiness(input);
      setBusinessId(saved._id);
      setVerificationStatus(saved.verificationStatus);
      setForm(toForm(saved));
      setFeedback({
        tone: "success",
        text: `Business profile for ${saved.officialName} has been saved. Document Submission is the next onboarding step.`,
      });
      if (!businessId) window.location.assign('/business/documents');
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "The profile could not be saved.",
        details: error instanceof ApiError ? error.details : undefined,
      });
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
                ["Application Status", "/business/review-status"],
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
              Tell Us About Your Business
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-[15px] leading-7 text-[#526B82]">
              Provide some details about your business so we can understand its background and
              operations.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="page-container">
            <div className="mb-8 grid grid-cols-4 overflow-hidden rounded-2xl border border-[#DCE5EB] bg-white shadow-[0_6px_22px_rgba(16,42,67,.05)] lg:hidden">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`px-2 py-4 text-center ${step.state === "active" ? "bg-[#ECFDF5]" : ""}`}
                >
                  <span
                    className={`mx-auto grid h-7 w-7 place-items-center rounded-full border text-[10px] font-bold ${
                      step.state === "complete"
                        ? "border-[#6ED5B0] bg-[#DDF6EC] text-[#047857]"
                        : step.state === "active"
                          ? "border-[#059669] bg-[#059669] text-white"
                          : "border-[#D9E2EC] bg-[#EDF2F7] text-[#829AB1]"
                    }`}
                  >
                    {step.state === "complete" ? <StepCheck /> : step.number}
                  </span>
                  <p
                    className={`mt-2 text-[9px] font-bold sm:text-[10px] ${
                      step.state === "active"
                        ? "text-[#047857]"
                        : step.state === "complete"
                          ? "text-[#526B82]"
                          : "text-[#829AB1]"
                    }`}
                  >
                    {step.short}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid overflow-hidden rounded-[24px] border border-[#DCE5EB] bg-white shadow-[0_18px_50px_rgba(16,42,67,.09)] lg:grid-cols-[360px_1fr]">
              <aside className="hidden bg-[#102A43] p-10 text-white lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5EE0B5]">
                  Your application journey
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                  Build a clear business profile
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#B7C9D8]">
                  Accurate business information helps make the later review and campaign steps
                  easier to understand.
                </p>

                <div className="mt-10">
                  {steps.map((step, index) => (
                    <div key={step.number} className="relative flex gap-4 pb-8 last:pb-0">
                      {index < steps.length - 1 && (
                        <span className="absolute bottom-0 left-[17px] top-9 w-px bg-white/15" />
                      )}
                      <div className="relative z-10">
                        <StepMarker state={step.state} number={step.number} />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            step.state === "active"
                              ? "text-white"
                              : step.state === "complete"
                                ? "text-[#D7E4EC]"
                                : "text-[#B7C9D8]"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#7F9AAE]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="p-6 sm:p-9 lg:p-12">
                <div className="flex flex-col justify-between gap-3 border-b border-[#E3EAF0] pb-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#059669]">
                      Step 2 of 4
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#102A43]">
                      Business Profile
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#829AB1]">
                    Fields marked optional may be skipped
                  </p>
                </div>

                <form onSubmit={saveProfile} className="mt-7" aria-busy={loading || saving}>
                  {identityLocked && <p className="mb-5 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-800">Business name, type and sector are locked while your business is pending review or approved.</p>}
                  {loadFailed && <p role="alert" className="mb-5 text-sm text-red-700">Your profile could not be loaded. <button type="button" onClick={() => window.location.reload()} className="font-bold underline">Reload to try again</button></p>}
                  {loading && (
                    <p className="mb-5 text-xs font-semibold text-[#526B82]" role="status">
                      Loading your saved profile…
                    </p>
                  )}
                  <fieldset disabled={loading || saving || loadFailed} className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <TextField
                        id="official-business-name"
                        disabled={identityLocked}
                        label="Official Business Name"
                        placeholder="Enter the registered business name"
                        value={form.officialName}
                        onChange={(value) => updateField("officialName", value)}
                        autoComplete="organization"
                      />
                    </div>
                    <SelectField
                      id="business-type"
                      disabled={identityLocked}
                      label="Business Type"
                      placeholder="Select the legal form"
                      options={businessTypes}
                      value={form.businessType}
                      onChange={(value) => updateField("businessType", value)}
                    />
                    <SelectField
                      id="business-sector"
                      disabled={identityLocked}
                      label="Business Sector"
                      placeholder="Select a sector"
                      options={sectors}
                      value={form.sector}
                      onChange={(value) => updateField("sector", value)}
                    />
                    <SelectField
                      id="business-size"
                      label="Business Size"
                      placeholder="Select business size"
                      options={businessSizes}
                      value={form.size}
                      onChange={(value) => updateField("size", value)}
                    />
                    <TextField
                      id="year-established"
                      label="Year Established"
                      type="number"
                      placeholder="For example, 2018"
                      value={form.establishedYear}
                      onChange={(value) => updateField("establishedYear", value)}
                    />

                    <div className="sm:col-span-2">
                      <p className="mb-3 mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#829AB1]">
                        Business Location
                      </p>
                      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                        <TextField
                          id="division"
                          label="Division"
                          placeholder="For example, Dhaka"
                          value={form.division}
                          onChange={(value) => updateField("division", value)}
                        />
                        <TextField
                          id="district"
                          label="District"
                          placeholder="Enter the district"
                          value={form.district}
                          onChange={(value) => updateField("district", value)}
                        />
                        <div className="sm:col-span-2">
                          <TextField
                            id="detailed-address"
                            label="Detailed Address"
                            placeholder="Street, area, postal code"
                            value={form.address}
                            onChange={(value) => updateField("address", value)}
                            autoComplete="street-address"
                          />
                        </div>
                      </div>
                    </div>

                    <label htmlFor="business-description" className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-bold text-[#334E68]">
                        Business Description
                      </span>
                      <textarea
                        id="business-description"
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        required
                        rows={5}
                        placeholder="Explain what your business does and the products or services it offers."
                        className="w-full resize-y rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
                      />
                      <span className="mt-1.5 block text-[10px] text-[#829AB1]">
                        A concise overview (at least 20 characters) helps reviewers understand your
                        day-to-day operations.
                      </span>
                    </label>

                    <label htmlFor="operating-history" className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-bold text-[#334E68]">
                        Operating History (Optional)
                      </span>
                      <textarea
                        id="operating-history"
                        value={form.operatingHistory}
                        onChange={(event) => updateField("operatingHistory", event.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="Key milestones, such as when you opened, expanded or changed what you offer."
                        className="w-full resize-y rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10"
                      />
                    </label>

                    <TextField
                      id="number-of-employees"
                      label="Number of Employees"
                      type="number"
                      placeholder="For example, 12"
                      value={form.employeeCount}
                      onChange={(value) => updateField("employeeCount", value)}
                    />
                    <TextField
                      id="business-website"
                      label="Business Website (Optional)"
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={form.website}
                      onChange={(value) => updateField("website", value)}
                      required={false}
                      autoComplete="url"
                    />
                    <TextField
                      id="business-contact-email"
                      label="Business Contact Email"
                      type="email"
                      placeholder="contact@yourbusiness.com"
                      value={form.businessEmail}
                      onChange={(value) => updateField("businessEmail", value)}
                      autoComplete="email"
                    />
                    <TextField
                      id="business-contact-phone"
                      label="Business Contact Phone Number"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={form.contactPhone}
                      onChange={(value) => updateField("contactPhone", value)}
                      autoComplete="tel"
                    />
                  </fieldset>

                  <div className="mt-7 rounded-xl border border-[#DCE7ED] bg-[#F8FAFC] px-4 py-3.5">
                    <p className="text-xs leading-5 text-[#526B82]">
                      Your business information will be reviewed before you can publish an
                      investment campaign. FundTogether is a simulated investment platform.
                    </p>
                  </div>

                  {feedback && (
                    <div
                      className={`mt-5 rounded-xl border p-4 text-xs font-semibold leading-5 ${
                        feedback.tone === "success"
                          ? "border-[#BDE8D9] bg-[#ECFDF5] text-[#047857]"
                          : "border-[#F5C2C0] bg-[#FEF2F2] text-[#B42318]"
                      }`}
                      role={feedback.tone === "error" ? "alert" : "status"}
                      aria-live="polite"
                    >
                      {feedback.text}
                      {feedback.details && feedback.details.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 font-medium">
                          {feedback.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-[#E3EAF0] pt-6 sm:flex-row">
                    <a
                      href="/business/review-status"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-6 text-sm font-bold text-[#102A43] transition hover:bg-[#F8FAFC]"
                    >
                      <ArrowLeft /> Back
                    </a>
                    <button
                      type="submit"
                      disabled={loading || saving || loadFailed}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(5,150,105,.2)] transition hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving…" : businessId ? "Save Changes" : "Save & Continue"}{" "}
                      <ArrowRight />
                    </button>
                  </div>
                  {businessId && <a href="/business/documents" className="mt-5 inline-flex text-sm font-bold text-[#047857]">Continue to Documents →</a>}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B2135] text-[#B7C9D8]">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-6 border-b border-white/10 py-8 md:flex-row md:items-center">
            <div>
              <Logo inverse />
              <p className="mt-3 max-w-[430px] text-xs leading-5 text-[#92A9BA]">
                A transparent, educational simulation platform for exploring business funding
                concepts.
              </p>
            </div>
            <p className="max-w-[530px] rounded-xl bg-white/[.04] px-4 py-3 text-[10px] leading-5 text-[#92A9BA]">
              Business profile information is saved to FundTogether's database for review. All
              funding activity on FundTogether is simulated.
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
