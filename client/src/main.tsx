import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import AppRouter from "./AppRouter";
import SessionProvider from "./auth/SessionProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <React.Suspense fallback={<div role="status" className="grid min-h-screen place-items-center bg-[#F6F9FB] text-sm text-[#526B82]">Loading page…</div>}>
          <AppRouter />
        </React.Suspense>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
