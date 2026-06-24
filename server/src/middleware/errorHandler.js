// Centralized error handling. NEVER leak stack traces, internal messages, or
// downstream provider errors to the client.
import { logSuspicious } from "../lib/securityLog.js";

export function notFound(req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars -- Express requires 4 args to treat this as an error handler
export function errorHandler(err, req, res, next) {
  // Oversized body -> 413 (potential abuse / malformed client). Log + generic.
  if (err?.type === "entity.too.large") {
    logSuspicious(req, "payload_too_large", { limit: err.limit, length: err.length });
    return res.status(413).json({ error: "Request too large." });
  }

  // Body-parser JSON syntax errors -> generic 400 (often malformed/scripted).
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    logSuspicious(req, "bad_json", {});
    return res.status(400).json({ error: "Invalid request." });
  }

  // Unexpected error: log full detail server-side only, return generic 500.
  console.error("[error]", err?.stack || err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
