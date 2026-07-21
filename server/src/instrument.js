// Sentry initialization. Imported FIRST (before any other module) by
// index.js so Sentry's auto-instrumentation can hook Node's core modules
// (http, etc.) before express and friends are required — this is Sentry's
// documented requirement for its Node SDK, not a stylistic choice.
//
// Loads dotenv itself (rather than relying on index.js to have done it
// already) so SENTRY_DSN/NODE_ENV are available at the moment Sentry.init()
// reads them, regardless of import order elsewhere.
import "dotenv/config";
import * as Sentry from "@sentry/node";

// Only report errors when explicitly configured AND running in production —
// never send events from local dev or CI, even if a DSN is accidentally set.
const dsn = process.env.SENTRY_DSN;
const environment = process.env.NODE_ENV || "development";

if (dsn && environment === "production") {
  Sentry.init({
    dsn,
    environment,
    release: process.env.APP_VERSION,
    // Error monitoring only — no performance tracing/profiling, which this
    // project doesn't otherwise use and which would add overhead + noise.
    tracesSampleRate: 0,
  });
}
