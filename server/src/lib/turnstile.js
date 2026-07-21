// Verifies Cloudflare Turnstile tokens server-side (the client only ever
// proves it passed a challenge — the proof is meaningless until we confirm
// it with Cloudflare ourselves).
//
// SECRETS LIVE HERE, SERVER-SIDE ONLY. TURNSTILE_SECRET_KEY never reaches
// the browser — the client only holds the public site key
// (VITE_TURNSTILE_SITE_KEY, safe to expose by design).
//
// Skipped entirely (with a console warning) if TURNSTILE_SECRET_KEY isn't
// set, matching this project's pattern for optional integrations (Google
// Sheets, email) so local dev stays frictionless. See README for why this
// is an accepted tradeoff rather than a gap: honeypot + validation + rate
// limiting are always active regardless of Turnstile being configured.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 8000;

/** True once TURNSTILE_SECRET_KEY is set. */
export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verify a Turnstile response token with Cloudflare.
 * @param {string} token the client-supplied Turnstile response token
 * @param {string} [remoteIp] the requester's IP, passed through to Cloudflare
 * @returns {Promise<{success: boolean, errorCodes: string[]}>} never throws
 *   for a bad/missing token or a Cloudflare-side failure — those are just
 *   `success: false`. Throws only if called while unconfigured, which is a
 *   caller bug (check isTurnstileConfigured() first).
 */
export async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Turnstile is not configured (TURNSTILE_SECRET_KEY missing).");
  }
  if (!token || typeof token !== "string") {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    if (!res.ok) {
      return { success: false, errorCodes: [`http-${res.status}`] };
    }
    const data = await res.json();
    return { success: Boolean(data.success), errorCodes: data["error-codes"] || [] };
  } catch (err) {
    return { success: false, errorCodes: [err.name === "AbortError" ? "timeout" : "network-error"] };
  } finally {
    clearTimeout(timer);
  }
}
