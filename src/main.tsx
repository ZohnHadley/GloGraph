import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

// Local-first crash logging: forward uncaught errors / rejections to a log file
// under AppData (no network/telemetry). Pairs with the Rust panic hook.
function reportError(message: string) {
  invoke("log_frontend_error", { message }).catch(() => {});
}
window.addEventListener("error", e => {
  reportError(`error: ${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`);
});
window.addEventListener("unhandledrejection", e => {
  const r = e.reason;
  reportError(`unhandledrejection: ${r instanceof Error ? (r.stack ?? r.message) : String(r)}`);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
