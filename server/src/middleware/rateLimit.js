import rateLimit from "express-rate-limit";
import { logSuspicious } from "../lib/securityLog.js";

// Rate limit: max 5 submissions per IP per hour.
// Built as a factory so each app instance owns its own counter store
// (one instance in production; isolated instances in tests).
// Keyed by client IP (express resolves req.ip from X-Forwarded-For only when
// `trust proxy` is set — see app.js TRUST_PROXY handling).
export function createApplyRateLimiter() {
  // Defaults: 5 requests per IP per hour. Overridable via env for different
  // environments (e.g. higher in staging/tests).
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_MAX) || 5;
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // RateLimit-* headers
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
    handler: (req, res, _next, options) => {
      logSuspicious(req, "rate_limited", { limit: options.max, windowMs: options.windowMs });
      res.status(options.statusCode).json(options.message);
    },
  });
}
