import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CampaignDetails from "./CampaignDetails";
import Marketplace from "./Marketplace";
import "./index.css";
import SessionProvider from "./auth/SessionProvider";
import SessionGate from "./auth/SessionGate";

const Login = React.lazy(() => import("./Login"));
const AccountTypeSelection = React.lazy(() => import("./AccountTypeSelection"));

const BusinessRegistration = React.lazy(() => import("./BusinessRegistration"));
const BusinessProfileSetup = React.lazy(() => import("./BusinessProfileSetup"));
const BusinessDocumentSubmission = React.lazy(() => import("./BusinessDocumentSubmission"));
const DocumentReviewStatus = React.lazy(() => import("./DocumentReviewStatus"));

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";
const campaignDetailsPath = "/campaigns/shobuj-bazar";
const businessRegistrationPath = "/business/register";
const businessProfilePath = "/business/profile";
const businessDocumentsPath = "/business/documents";
const documentReviewStatusPath = "/business/review-status";

function Router() {
  const [location, setLocation] = React.useState(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
  const path = normalizePath(window.location.pathname);

  React.useEffect(() => {
    const updateLocation = () => {
      setLocation(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    };

    const handleInternalLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const destination = normalizePath(url.pathname);
      if (
        url.origin !== window.location.origin ||
        (destination !== "/" &&
          destination !== "/marketplace" &&
          destination !== "/login" &&
          destination !== "/register" &&
          destination !== campaignDetailsPath &&
          destination !== businessRegistrationPath &&
          destination !== businessProfilePath &&
          destination !== businessDocumentsPath &&
          destination !== documentReviewStatusPath)
      ) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      updateLocation();
    };

    window.addEventListener("popstate", updateLocation);
    document.addEventListener("click", handleInternalLink);
    return () => {
      window.removeEventListener("popstate", updateLocation);
      document.removeEventListener("click", handleInternalLink);
    };
  }, []);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (window.location.hash) {
          const id = decodeURIComponent(window.location.hash.slice(1));
          document.getElementById(id)?.scrollIntoView();
        } else {
          window.scrollTo({ top: 0 });
        }
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  if (path === "/marketplace") return <Marketplace />;
  if (path === "/login") return <Login next={new URLSearchParams(window.location.search).get("next") ?? ""} />;
  if (path === "/register") return <AccountTypeSelection />;
  if (path === campaignDetailsPath) return <SessionGate><CampaignDetails /></SessionGate>;
  if (path === businessRegistrationPath) {
    return (
      <React.Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm font-semibold text-[#526B82]">
            Loading registration…
          </div>
        }
      >
        <BusinessRegistration />
      </React.Suspense>
    );
  }
  if (path === businessProfilePath) {
    return (
      <React.Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm font-semibold text-[#526B82]">
            Loading business profile…
          </div>
        }
      >
        <SessionGate ownerOnly><BusinessProfileSetup /></SessionGate>
      </React.Suspense>
    );
  }
  if (path === businessDocumentsPath) {
    return (
      <React.Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm font-semibold text-[#526B82]">
            Loading document submission…
          </div>
        }
      >
        <SessionGate ownerOnly><BusinessDocumentSubmission /></SessionGate>
      </React.Suspense>
    );
  }
  if (path === documentReviewStatusPath) {
    return (
      <React.Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm font-semibold text-[#526B82]">
            Loading review status…
          </div>
        }
      >
        <SessionGate ownerOnly><DocumentReviewStatus /></SessionGate>
      </React.Suspense>
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionProvider>
      <React.Suspense fallback={<div role="status" className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm text-[#526B82]">Loading page…</div>}>
        <Router />
      </React.Suspense>
    </SessionProvider>
  </React.StrictMode>,
);
