// Input sanitization helpers. Applied BEFORE validation so we validate the
// cleaned value, and before forwarding so we never store/relay control chars
// or HTML that could enable injection in downstream systems (CRM, email, sheets).

/**
 * Collapse whitespace, strip control characters and angle brackets.
 * Angle brackets are removed to neutralize HTML/script injection in any
 * downstream consumer that renders the value (email clients, dashboards).
 */
export function cleanString(value, { maxLength = 2000 } = {}) {
  if (typeof value !== "string") return "";
  let s = value.normalize("NFC");
  // remove ASCII control chars (except none needed) and the Unicode line/para seps
  // eslint-disable-next-line no-control-regex -- intentional: stripping control chars is the point
  s = s.replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, " ");
  // strip angle brackets to defang HTML
  s = s.replace(/[<>]/g, "");
  // collapse runs of whitespace
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > maxLength) s = s.slice(0, maxLength);
  return s;
}

/** Sanitize the full application payload into a known-shape object of strings. */
export function sanitizeApplication(body = {}) {
  return {
    name: cleanString(body.name, { maxLength: 100 }),
    phone: cleanString(body.phone, { maxLength: 30 }),
    email: cleanString(body.email, { maxLength: 254 }).toLowerCase(),
    gender: cleanString(body.gender, { maxLength: 30 }),
    currentWeight: cleanString(body.currentWeight, { maxLength: 20 }),
    pathway: cleanString(body.pathway, { maxLength: 60 }),
    message: cleanString(body.message, { maxLength: 2000 }),
    // marketing attribution — free-form, not user-typed
    utm_source: cleanString(body.utm_source, { maxLength: 200 }),
    utm_medium: cleanString(body.utm_medium, { maxLength: 200 }),
    utm_campaign: cleanString(body.utm_campaign, { maxLength: 200 }),
    utm_content: cleanString(body.utm_content, { maxLength: 200 }),
    referrer: cleanString(body.referrer, { maxLength: 500 }),
    landingPage: cleanString(body.landingPage, { maxLength: 500 }),
    // honeypot — must be empty for real humans
    company: cleanString(body.company, { maxLength: 100 }),
  };
}
