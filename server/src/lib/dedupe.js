import crypto from "node:crypto";

// Duplicate-submission protection.
//
// We fingerprint each submission (email + phone) and remember it for a
// TTL window. A repeat within the window is treated as a duplicate so we don't
// forward the same lead twice (double-clicks, retries, refresh-resubmit).
//
// NOTE: this is in-memory and therefore per-process. For a multi-instance
// deployment, back this with a shared store (Redis SETEX) — the interface
// (isDuplicate/remember) stays the same.

const TTL_MS = 60 * 60 * 1000; // 1 hour
const seen = new Map(); // fingerprint -> expiry timestamp

function fingerprint(app) {
  const basis = `${app.email}|${app.phone}`;
  return crypto.createHash("sha256").update(basis).digest("hex");
}

function sweep(now) {
  for (const [key, expiry] of seen) {
    if (expiry <= now) seen.delete(key);
  }
}

/** Returns true if this submission was already seen within the TTL window. */
export function isDuplicate(app) {
  const now = Date.now();
  // opportunistic cleanup to bound memory
  if (seen.size > 5000) sweep(now);
  const key = fingerprint(app);
  const expiry = seen.get(key);
  return typeof expiry === "number" && expiry > now;
}

/** Record this submission so subsequent identical ones are rejected. */
export function remember(app) {
  seen.set(fingerprint(app), Date.now() + TTL_MS);
}

// Exposed for tests.
export function _reset() {
  seen.clear();
}
