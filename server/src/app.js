import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createApplyRouter } from "./routes/apply.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Behind a trusted proxy? Set TRUST_PROXY so req.ip reflects the real client
  // for rate limiting. Only enable when actually behind a proxy you control,
  // otherwise clients could spoof X-Forwarded-For to bypass the limiter.
  const trustProxy = process.env.TRUST_PROXY;
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

  // Liveness probe.
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // API routes.
  app.use("/api", createApplyRouter());

  // 404 + centralized error handler (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
