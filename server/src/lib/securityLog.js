// Structured logging for suspicious / abusive requests.
//
// Emits one-line JSON to stdout so platform log drains (Vercel, CloudWatch,
// Datadog, etc.) can index + alert on it. PII is minimized: we log the email
// DOMAIN only, never the full address, phone, name, or message.

function clientIp(req) {
  // req.ip is correct when `trust proxy` is configured (see app.js).
  return (
    req.ip ||
    (req.headers && req.headers["x-forwarded-for"]) ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function emailDomain(email) {
  if (typeof email !== "string") return null;
  const at = email.lastIndexOf("@");
  return at > 0 ? email.slice(at + 1) : null;
}

/**
 * @param {import('express').Request} req
 * @param {string} event  e.g. "honeypot" | "validation_failed" | "rate_limited"
 *                              | "duplicate" | "bad_json" | "payload_too_large"
 * @param {object} [details] extra non-PII context (field names, counts, domain)
 */
export function logSuspicious(req, event, details = {}) {
  const entry = {
    tag: "security",
    level: event === "duplicate" ? "info" : "warn",
    event,
    ts: new Date().toISOString(),
    ip: clientIp(req),
    method: req?.method,
    path: (req && (req.originalUrl || req.url)) || null,
    userAgent: (req?.get && req.get("user-agent")) || null,
    ...details,
  };
  // Single structured line; downstream tooling can parse/alert on tag=security.
  console.warn("[security] " + JSON.stringify(entry));
}
