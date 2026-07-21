// Sentry initialization for the browser. Called once from main.jsx before
// the app renders.
//
// Reports React render crashes (via ErrorBoundary.jsx), window.onerror, and
// unhandled promise rejections — the last two are captured automatically by
// Sentry's default browser integrations once init() runs below, no extra
// listeners needed.
//
// Events are ONLY sent when BOTH are true: this is a production build
// (import.meta.env.PROD, set by `vite build`) AND VITE_SENTRY_DSN is set —
// `vite dev` never sends events, even if a DSN is configured by accident.
import * as Sentry from "@sentry/react";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!import.meta.env.PROD || !dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Error monitoring only — no performance tracing/session replay, which
    // this project doesn't otherwise use and which would need additional
    // CSP allowances beyond what error reporting alone requires.
    tracesSampleRate: 0,
  });
}
