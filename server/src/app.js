import { createRequire } from "node:module";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as Sentry from "@sentry/node";
import { createApplyRouter } from "./routes/apply.js";
import { createDebugSmtpRouter } from "./routes/debugSmtp.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Version reported by /health. Prefer an env override (e.g. a CI-injected
// git SHA or release tag) so a deploy's exact build is identifiable; fall
// back to package.json for local dev. Never derived from anything secret.
const require = createRequire(import.meta.url);
const { version: packageVersion } = require("../package.json");
const APP_VERSION = process.env.APP_VERSION || packageVersion;

export function createApp() {
  const app = express();

  // Behind a trusted proxy? Set TRUST_PROXY so req.ip reflects the real client
  // for rate limiting. Only enable when actually behind a proxy you control,
  // otherwise clients could spoof X-Forwarded-For to bypass the limiter.
  //
  // Render always fronts the app with its own edge proxy exactly one hop
  // away, which sets X-Forwarded-For on every request; with `trust proxy`
  // left at Express's default (disabled), express-rate-limit refuses to
  // start (ERR_ERL_UNEXPECTED_X_FORWARDED_FOR) because it looks like a
  // possible spoofing setup. Render sets RENDER=true on every service, so we
  // can safely default to trusting one hop there without weakening the
  // "fails closed" default anywhere else. An explicit TRUST_PROXY always
  // wins (including TRUST_PROXY=0 to opt back out on Render).
  const trustProxyEnv = process.env.TRUST_PROXY;
  const trustProxy =
    trustProxyEnv !== undefined ? trustProxyEnv : process.env.RENDER === "true" ? "1" : undefined;
  if (trustProxy && trustProxy !== "0") {
    app.set("trust proxy", Number.isNaN(Number(trustProxy)) ? trustProxy : Number(trustProxy));
  }

  // Security headers.
  app.use(helmet());

  // CORS: only allow the configured browser origin(s).
  const origins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: origins.length ? origins : false, // no origins configured => block cross-origin
      methods: ["POST"],
      allowedHeaders: ["Content-Type"],
      maxAge: 86400,
    })
  );

  // Body parsing with a tight size cap to blunt payload-based abuse.
  app.use(express.json({ limit: "16kb" }));

  // Liveness probe. Deliberately minimal: process status/uptime/version only
  // — no config, no env values, no internals that could leak anything.
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
    });
  });

  // API routes.
  app.use("/api", createApplyRouter());

  // TEMPORARY DEBUG ENDPOINT — REMOVE BEFORE PRODUCTION
  // GET /debug/smtp — see routes/debugSmtp.js. Gated behind DEBUG_SMTP_TOKEN;
  // 404s when that env var isn't set. Delete this line + the import above +
  // routes/debugSmtp.js once the Render SMTP issue is diagnosed.
  app.use(createDebugSmtpRouter());

  // Reports unhandled errors to Sentry (a no-op if Sentry wasn't initialized
  // — see instrument.js). Registered after the routes so it sees anything
  // they throw/pass to next(err); its default filter only reports
  // 500-shaped errors, so the deliberately-handled 413/400 cases below never
  // reach it. Must come before our own error handler so it can inspect the
  // error before that handler shapes the response.
  Sentry.setupExpressErrorHandler(app);

  // 404 + centralized error handler (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
