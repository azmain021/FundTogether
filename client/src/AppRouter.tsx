import React from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import App from "./App";
import CampaignDetails from "./CampaignDetails";
import Marketplace from "./Marketplace";
import SessionGate from "./auth/SessionGate";

const Login = React.lazy(() => import("./Login"));
const AccountTypeSelection = React.lazy(() => import("./AccountTypeSelection"));
const PasswordRecovery = React.lazy(() => import("./PasswordRecovery"));
const AccountHome = React.lazy(() => import("./auth/AccountHome"));
const AccountSecurity = React.lazy(() => import("./auth/AccountSecurity"));
const BusinessRegistration = React.lazy(() => import("./BusinessRegistration"));
const BusinessProfileSetup = React.lazy(() => import("./BusinessProfileSetup"));
const BusinessDocumentSubmission = React.lazy(() => import("./BusinessDocumentSubmission"));
const DocumentReviewStatus = React.lazy(() => import("./DocumentReviewStatus"));
const CampaignList = React.lazy(() => import("./campaigns/CampaignList"));
const CampaignDraftPage = React.lazy(() => import("./campaigns/CampaignDraftPage"));

const appPaths = new Set([
  "/", "/marketplace", "/login", "/register", "/forgot-password", "/reset-password",
  "/campaigns/shobuj-bazar", "/business/register", "/investor/register",
  "/business/profile", "/business/documents", "/business/review-status", "/business/campaigns", "/investor", "/admin", "/account/security",
]);

export default function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleInternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const url = new URL(anchor.href, window.location.href);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      if (url.origin !== window.location.origin || !appPaths.has(path)) return;
      event.preventDefault();
      void navigate(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", handleInternalLink);
    return () => document.removeEventListener("click", handleInternalLink);
  }, [navigate]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!location.hash) {
        window.scrollTo({ top: 0 });
        return;
      }
      let id = location.hash.slice(1);
      try { id = decodeURIComponent(id); } catch { return; }
      document.getElementById(id)?.scrollIntoView();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  const next = new URLSearchParams(location.search).get("next") ?? "";
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/login" element={<Login next={next} />} />
      <Route path="/register" element={<AccountTypeSelection />} />
      <Route path="/forgot-password" element={<PasswordRecovery />} />
      <Route path="/reset-password" element={<PasswordRecovery />} />
      <Route path="/account/security" element={<SessionGate><AccountSecurity /></SessionGate>} />
      <Route path="/campaigns/shobuj-bazar" element={<SessionGate><CampaignDetails /></SessionGate>} />
      <Route path="/business/register" element={<BusinessRegistration key="owner" />} />
      <Route path="/investor/register" element={<BusinessRegistration key="investor" investor />} />
      <Route path="/business/profile" element={<SessionGate roles={["business_owner"]}><BusinessProfileSetup /></SessionGate>} />
      <Route path="/business/documents" element={<SessionGate roles={["business_owner"]}><BusinessDocumentSubmission /></SessionGate>} />
      <Route path="/business/review-status" element={<SessionGate roles={["business_owner"]}><DocumentReviewStatus /></SessionGate>} />
      <Route path="/business/campaigns" element={<SessionGate roles={["business_owner"]}><CampaignList /></SessionGate>} />
      <Route path="/business/campaigns/new" element={<SessionGate roles={["business_owner"]}><CampaignDraftPage /></SessionGate>} />
      <Route path="/business/campaigns/:id" element={<SessionGate roles={["business_owner"]}><CampaignDraftPage /></SessionGate>} />
      <Route path="/investor" element={<SessionGate roles={["investor"]}><AccountHome role="investor" /></SessionGate>} />
      <Route path="/admin" element={<SessionGate roles={["admin"]}><AccountHome role="admin" /></SessionGate>} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}
