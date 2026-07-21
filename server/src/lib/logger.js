// Structured, human-readable production logging for lead-processing events
// (form submissions, Google Sheets delivery, email delivery).
//
// Every line is `[category] {flat JSON}` — a human can read it directly
// (grep '[sheets]', eyeball the fields) while log drains (Vercel, CloudWatch,
// Datadog, etc.) can parse and index it as JSON. Same convention as
// `securityLog.js`'s `[security] {...}` lines, kept as a separate module
// because security events (abuse/validation/duplicate/rate-limit) deliberately
// minimize PII (email DOMAIN only — see securityLog.js), whereas these
// delivery/lifecycle events legitimately need the applicant's email address
// to let a human trace *which lead* failed to save/send and follow up.
//
// SECRET SAFETY: call sites must never pass credentials/tokens/keys as
// fields. As a defense-in-depth backstop, any field whose name looks like a
// credential is redacted before the line is ever written.

const SECRET_KEY_PATTERN = /pass|secret|token|private.?key|api.?key|auth(orization)?$/i;

function redactSecrets(fields) {
  const safe = {};
  for (const [key, value] of Object.entries(fields)) {
    safe[key] = SECRET_KEY_PATTERN.test(key) ? "[redacted]" : value;
  }
  return safe;
}

const WRITERS = { info: console.log, warn: console.warn, error: console.error };

/**
 * @param {"submission"|"sheets"|"email"} category
 * @param {"info"|"warn"|"error"} level
 * @param {string} event short machine-readable event name, e.g. "sheets_saved"
 * @param {object} [fields] structured context. Never pass secrets/credentials
 *   (API keys, service-account keys, tokens) — only lead/request context.
 */
export function log(category, level, event, fields = {}) {
  const entry = {
    tag: category,
    level,
    event,
    ts: new Date().toISOString(),
    ...redactSecrets(fields),
  };
  const write = WRITERS[level] || console.log;
  write(`[${category}] ` + JSON.stringify(entry));
}
