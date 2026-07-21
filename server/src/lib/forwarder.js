// Forwards a validated, sanitized lead to your CRM / email provider / webhook.
//
// SECRETS LIVE HERE, SERVER-SIDE ONLY. The browser never sees LEAD_WEBHOOK_TOKEN
// or CRM_API_KEY — it only ever talks to our own /api/apply route.
//
// Provider-agnostic: configure a generic webhook (Zapier, Make, Google Apps
// Script, your CRM intake URL, etc.) via env. If nothing is configured we log
// and succeed, which keeps local development frictionless.

const TIMEOUT_MS = 8000;

async function postJson(url, token, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Downstream responded ${res.status}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deliver the lead. Throws on hard failure so the route returns a generic 502.
 * @param {object} application sanitized + validated fields
 * @param {object} meta { ip, userAgent, submittedAt }
 */
export async function forwardLead(application, meta) {
  const payload = {
    ...application,
    source: "athlix-website",
    receivedAt: new Date().toISOString(),
    clientSubmittedAt: meta.submittedAt ?? null,
    // minimal request context for auditing/anti-abuse; no secrets
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  };

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  const webhookToken = process.env.LEAD_WEBHOOK_TOKEN;
  const crmUrl = process.env.CRM_API_URL;
  const crmKey = process.env.CRM_API_KEY;

  const targets = [];
  if (webhookUrl) targets.push(postJson(webhookUrl, webhookToken, payload));
  if (crmUrl) targets.push(postJson(crmUrl, crmKey, payload));

  if (targets.length === 0) {
    // No destination configured (e.g. local dev). Accept + log, don't leak PII verbosely.
    console.log(
      `[apply] lead accepted (no destination configured): ${application.email} / pathway=${application.pathway}`
    );
    return;
  }

  // All configured destinations must succeed.
  await Promise.all(targets);
}
