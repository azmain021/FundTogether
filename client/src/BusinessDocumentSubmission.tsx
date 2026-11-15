import { useState, type DragEvent, type FormEvent } from "react";

type IconProps = { className?: string };
type SelectedFile = { name: string; size: number };

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

const DocumentIcon = () => (
  <svg
    className="h-5 w-5"
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

const UploadIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m-4 4 4-4 4 4" />
    <path strokeLinecap="round" d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" />
  </svg>
);

const Trash = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"
    />
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
    description: "Your owner account details.",
    state: "complete",
  },
  {
    number: "02",
    short: "Profile",
    title: "Business Profile",
    description: "Your business background.",
    state: "complete",
  },
  {
    number: "03",
    short: "Documents",
    title: "Document Submission",
    description: "Share supporting information.",
    state: "active",
  },
  {
    number: "04",
    short: "Campaign",
    title: "Campaign Creation",
    description: "Prepare your simulation campaign.",
    state: "inactive",
  },
] as const;

const documentTypes = [
  {
    id: "trade-license",
    title: "Trade License",
    description: "Upload your business trade license.",
    required: true,
    multiple: false,
  },
  {
    id: "tin",
    title: "Tax Identification (TIN) Certificate",
    description: "Provide your business TIN certificate, if available.",
    required: false,
    multiple: false,
  },
  {
    id: "owner-nid",
    title: "Business Owner's National ID",
    description: "Upload the front and back of the owner's NID.",
    required: true,
    multiple: true,
  },
  {
    id: "address-proof",
    title: "Business Address Proof",
    description: "Provide a utility bill, rental agreement, or other address evidence.",
    required: true,
    multiple: false,
  },
  {
    id: "additional",
    title: "Additional Supporting Documents",
    description: "Upload any other documents that help establish business credibility.",
    required: false,
    multiple: true,
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

function FileRow({ file, onRemove }: { file: SelectedFile; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#CDEEE1] bg-[#F0FDF8] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-[#102A43]">{file.name}</p>
        <p className="mt-0.5 text-[10px] text-[#047857]">
          Ready for simulated submission · {(file.size / 1_048_576).toFixed(1)} MB
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#829AB1] transition hover:bg-white hover:text-[#B42318]"
        aria-label={`Remove ${file.name}`}
      >
        <Trash />
      </button>
    </div>
  );
}

function UploadCard({
  document,
  files,
  error,
  onFiles,
  onRemove,
}: {
  document: (typeof documentTypes)[number];
  files: SelectedFile[];
  error?: string;
  onFiles: (files: FileList | File[]) => void;
  onRemove: (index: number) => void;
}) {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
  };

  return (
    <article className="flex h-full flex-col rounded-[18px] border border-[#E3EAF0] bg-white p-5 shadow-[0_5px_20px_rgba(16,42,67,.045)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E7F8F1] text-[#059669]">
          <DocumentIcon />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#102A43]">{document.title}</h3>
            <span
              className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.06em] ${
                document.required ? "bg-[#FFF4E5] text-[#9A5B13]" : "bg-[#EDF2F7] text-[#627D98]"
              }`}
            >
              {document.required ? "Required" : "Optional"}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-[#627D98]">{document.description}</p>
        </div>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="mt-5 flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#BCCCDC] bg-[#F8FAFC] px-4 py-5 text-center transition hover:border-[#72CDAE] hover:bg-[#F2FBF7]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#059669] shadow-sm">
          <UploadIcon />
        </span>
        <p className="mt-3 text-xs font-semibold text-[#334E68]">Drag and drop files here</p>
        <label
          htmlFor={`file-${document.id}`}
          className="mt-2 cursor-pointer text-xs font-bold text-[#059669] hover:text-[#047857]"
        >
          Browse Files
        </label>
        <input
          id={`file-${document.id}`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          multiple={document.multiple}
          onChange={(event) => {
            if (event.currentTarget.files) onFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />
        <p className="mt-2 text-[9px] leading-4 text-[#829AB1]">
          PDF, JPG or PNG · Maximum 10 MB per file
        </p>
      </div>

      {error && <p className="mt-2 text-[10px] font-semibold text-[#B42318]">{error}</p>}

      {files.length > 0 ? (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <FileRow key={`${file.name}-${index}`} file={file} onRemove={() => onRemove(index)} />
          ))}
          <label
            htmlFor={`file-${document.id}`}
            className="inline-flex cursor-pointer text-[10px] font-bold text-[#059669] hover:text-[#047857]"
          >
            {document.multiple ? "Add or replace files" : "Replace file"}
          </label>
        </div>
      ) : (
        <p className="mt-3 text-[10px] text-[#829AB1]">No file selected</p>
      )}
    </article>
  );
}

export default function BusinessDocumentSubmission() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [files, setFiles] = useState<Record<string, SelectedFile[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const addFiles = (document: (typeof documentTypes)[number], incoming: FileList | File[]) => {
    const candidates = Array.from(incoming);
    const valid: SelectedFile[] = [];
    let validationError = "";

    for (const file of candidates) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !["pdf", "jpg", "jpeg", "png"].includes(extension)) {
        validationError = "Choose PDF, JPG or PNG files only.";
        continue;
      }
      if (file.size > 10 * 1_048_576) {
        validationError = "Each file must be 10 MB or smaller.";
        continue;
      }
      valid.push({ name: file.name, size: file.size });
    }

    if (valid.length) {
      setFiles((current) => ({
        ...current,
        [document.id]: document.multiple ? [...(current[document.id] ?? []), ...valid] : [valid[0]],
      }));
    }
    setErrors((current) => ({ ...current, [document.id]: validationError }));
    setMessage("");
  };

  const removeFile = (documentId: string, index: number) => {
    setFiles((current) => ({
      ...current,
      [documentId]: (current[documentId] ?? []).filter((_, fileIndex) => fileIndex !== index),
    }));
    setMessage("");
  };

  const submitDocuments = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = documentTypes.filter((document) => {
      if (!document.required) return false;
      const minimumFiles = document.id === "owner-nid" ? 2 : 1;
      return (files[document.id]?.length ?? 0) < minimumFiles;
    });

    if (missing.length) {
      setHasError(true);
      setMessage(`Add the required documents: ${missing.map((item) => item.title).join(", ")}.`);
      return;
    }
    if (!confirmed) {
      setHasError(true);
      setMessage("Confirm that the selected documents are accurate before continuing.");
      return;
    }

    setHasError(false);
    setMessage(
      "Documents are ready for the simulated review step. No files were uploaded, stored or verified by a backend.",
    );
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
          <a
            href="/business/profile"
            className="hidden min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 text-sm font-semibold text-[#102A43] transition hover:bg-[#F8FAFC] lg:inline-flex"
          >
            <ArrowLeft /> Business Profile
          </a>
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
          <div className="page-container py-10 text-center sm:py-12">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#059669]">
              Business owner onboarding
            </p>
            <h1 className="mt-3 text-[36px] font-bold leading-tight tracking-[-0.045em] text-[#102A43] sm:text-[44px]">
              Verify Your Business
            </h1>
            <p className="mx-auto mt-4 max-w-[720px] text-[15px] leading-7 text-[#526B82]">
              Upload supporting documents so our review team can understand and verify your business
              information.
            </p>
            <p className="mx-auto mt-2 max-w-[620px] text-[11px] leading-5 text-[#829AB1]">
              Files selected on this prototype remain in your browser and are not uploaded to a
              server.
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
                    className={`mt-2 text-[9px] font-bold sm:text-[10px] ${step.state === "active" ? "text-[#047857]" : "text-[#829AB1]"}`}
                  >
                    {step.short}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid overflow-hidden rounded-[24px] border border-[#DCE5EB] bg-white shadow-[0_18px_50px_rgba(16,42,67,.09)] lg:grid-cols-[330px_1fr]">
              <aside className="hidden bg-[#102A43] p-9 text-white lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5EE0B5]">
                  Your application journey
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                  Add supporting information
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#B7C9D8]">
                  Documents help the simulated review process understand your business details.
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
                          className={`text-sm font-bold ${step.state === "active" ? "text-white" : step.state === "complete" ? "text-[#D7E4EC]" : "text-[#B7C9D8]"}`}
                        >
                          {step.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#7F9AAE]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <form onSubmit={submitDocuments} className="p-6 sm:p-9 lg:p-10">
                <div className="flex flex-col justify-between gap-3 border-b border-[#E3EAF0] pb-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#059669]">
                      Step 3 of 4
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#102A43]">
                      Document Submission
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#829AB1]">PDF, JPG or PNG · 10 MB maximum</p>
                </div>

                <div className="mt-7 grid items-stretch gap-5 md:grid-cols-2">
                  {documentTypes.map((document) => (
                    <UploadCard
                      key={document.id}
                      document={document}
                      files={files[document.id] ?? []}
                      error={errors[document.id]}
                      onFiles={(selectedFiles) => addFiles(document, selectedFiles)}
                      onRemove={(index) => removeFile(document.id, index)}
                    />
                  ))}
                </div>

                <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-xl border border-[#E3EAF0] bg-[#F8FAFC] p-4">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked);
                      setMessage("");
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-[#BCCCDC] accent-[#059669]"
                  />
                  <span className="text-xs leading-5 text-[#526B82]">
                    I confirm that the selected documents are accurate and belong to the business or
                    its owner.
                  </span>
                </label>

                <p className="mt-4 text-[11px] leading-5 text-[#829AB1]">
                  Submitting documents does not guarantee approval. FundTogether uses a simulated
                  review process for educational purposes.
                </p>

                {message && (
                  <div
                    className={`mt-5 rounded-xl border p-4 text-xs font-semibold leading-5 ${
                      hasError
                        ? "border-[#F3C7C7] bg-[#FFF5F5] text-[#B42318]"
                        : "border-[#BDE8D9] bg-[#ECFDF5] text-[#047857]"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {message}
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-[#E3EAF0] pt-6 sm:flex-row">
                  <a
                    href="/business/profile"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-6 text-sm font-bold text-[#102A43] transition hover:bg-[#F8FAFC]"
                  >
                    <ArrowLeft /> Back
                  </a>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(5,150,105,.2)] transition hover:bg-[#047857]"
                  >
                    Submit Documents <ArrowRight />
                  </button>
                </div>
              </form>
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
              Selected documents remain in this frontend prototype. They are not uploaded, stored,
              reviewed or verified by a backend.
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
