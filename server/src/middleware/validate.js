import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { sanitizeApplication } from "../lib/sanitize.js";
import { logSuspicious } from "../lib/securityLog.js";

// Allow-lists mirror the frontend's select options. Anything else is rejected.
// (These values are already public in the UI, so echoing them is not a leak.)
const PATHWAYS = ["Online Coaching", "Offline Coaching", "Hybrid Coaching", "Not Sure Yet"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

// Strict, complete schema. Runs AFTER sanitization. We NEVER trust the client:
// every field is independently validated here even though the UI also checks.
// Messages are curated + safe (no internals, no stack, no echoed input).
const applicationSchema = z.object({
  // Name: 2–100 chars, must contain a letter, must not look like a URL/handle.
  name: z
    .string()
    .min(2, "Please enter your full name.")
    .max(100, "Name is too long.")
    .regex(/\p{L}/u, "Please enter a valid name.")
    .refine((v) => !/(https?:\/\/|www\.|@)/i.test(v), { message: "Please enter a valid name." }),

  // Email: RFC-ish format, capped at the SMTP max of 254.
  email: z
    .string()
    .min(1, "Email is required.")
    .max(254, "Email is too long.")
    .email("Enter a valid email address."),

  // Phone: full international number (E.164, with country code) coming from
  // the frontend's country-select phone input. Validated per-country via
  // libphonenumber-js rather than a generic digit-count regex.
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .refine((v) => isValidPhoneNumber(v), { message: "Enter a valid phone number." }),

  // Weight (kg): numeric 20–500 (covers any realistic adult weight).
  currentWeight: z.coerce
    .number({ invalid_type_error: "Enter a valid weight." })
    .min(20, "Enter a valid weight.")
    .max(500, "Enter a valid weight."),

  // Gender / Pathway: must be one of the allow-listed options.
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Please select a valid option." }) }),
  pathway: z.enum(PATHWAYS, { errorMap: () => ({ message: "Please select a pathway." }) }),

  // Message: optional, capped at 2000 chars.
  message: z.string().max(2000, "Message is too long.").optional().default(""),

  // Marketing attribution: optional, free-form (set by ad platforms / the
  // browser, not user input in a form field), so just capped — no format
  // enforcement. Never surfaced to the applicant; used for lead reporting.
  utm_source: z.string().max(200).optional().default(""),
  utm_medium: z.string().max(200).optional().default(""),
  utm_campaign: z.string().max(200).optional().default(""),
  utm_content: z.string().max(200).optional().default(""),
  referrer: z.string().max(500).optional().default(""),
});

/**
 * Sanitizes the body, runs the honeypot check, then validates server-side.
 * On success attaches `req.application` (clean, typed) and `req.isHoneypot`.
 * On failure responds 400 with SAFE, field-level messages (no internals/PII).
 */
export function validateApplication(req, res, next) {
  const clean = sanitizeApplication(req.body || {});

  // Honeypot: real users never fill `company`. If present, flag it; the route
  // will silently accept (200) without forwarding, so bots get no signal.
  req.isHoneypot = clean.company.length > 0;

  const result = applicationSchema.safeParse(clean);
  if (!result.success) {
    // Build a safe { field: message } map — first message per field only.
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key && !fields[key]) fields[key] = issue.message;
    }
    // Log only the failing field NAMES (never values) for abuse detection.
    logSuspicious(req, "validation_failed", { fields: Object.keys(fields) });
    return res.status(400).json({ error: "Please correct the highlighted fields.", fields });
  }

  req.application = result.data;
  next();
}

// Exposed for tests / reuse.
export { PATHWAYS, GENDERS };
