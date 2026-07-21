// Sends lead emails via Hostinger SMTP: an internal notification to the team
// inbox, and a branded confirmation to the applicant.
//
// SECRETS LIVE HERE, SERVER-SIDE ONLY. The browser never sees SMTP_USER /
// SMTP_PASS — it only ever talks to our own /api/apply route.
//
// Both templates share one dark-navy/blue "Athlix" shell (buildEmailShell)
// so every outgoing email is visually consistent; the applicant email uses
// the spacious/premium variant, the admin notification uses the compact one.

import dns from "node:dns";
import net from "node:net";
import nodemailer from "nodemailer";
import { log } from "./logger.js";

const CONNECTION_TIMEOUT_MS = 10000;

// Force the SMTP connection over IPv4 by default. Nodemailer resolves both
// A and AAAA records for SMTP_HOST and then picks RANDOMLY between them
// (see its lib/shared/index.js `formatDNSValue`) — on Render (and other
// containerized platforms) the container reports a local IPv6-capable
// interface even though there's no real outbound IPv6 route, so nodemailer
// occasionally picks an unreachable IPv6 address and the connection fails
// with `connect ENETUNREACH <ipv6>`. We resolve SMTP_HOST to an IPv4 literal
// ourselves before handing it to nodemailer (see resolveConnectHost below),
// sidestepping that random choice entirely. Set SMTP_FORCE_IPV4=false to
// disable if a provider ever requires IPv6.
const SMTP_FORCE_IPV4 = process.env.SMTP_FORCE_IPV4 !== "false";

// ── Brand constants ─────────────────────────────────────────────────────────
// Same palette as the public site (client/tailwind.config.js: athlix-navy /
// athlix-blue / athlix-deep) so every touchpoint — site and email — matches.
const NAVY = "#0B1020";
const NAVY_SOFT = "#131b33"; // body panel, one step lighter than the card edge
const NAVY_FOOTER = "#070a14"; // footer bar, one step darker
const BLUE = "#0A66FF";
const BLUE_DEEP = "#0052CC";
const WHATSAPP_GREEN = "#25D366";
const TEXT_LIGHT = "#E7EAF3";
const TEXT_MUTED = "#8B95AC";
const BORDER_SUBTLE = "rgba(255,255,255,0.08)";

// Contact/brand identity shown in every email. The WhatsApp number and coach
// name are public brand identity (the same number is already the site's
// "Book Consultation" CTA), not per-deployment secrets, so — like the site —
// they're constants here rather than env vars. `SITE_URL` matches the
// production domain already used in nginx.conf/DEPLOYMENT.md.
const SITE_URL = "https://athlix.in";
const COACH_NAME = "Coach Abhishek";
const WHATSAPP_DIGITS = "919030153337"; // +91 90301 53337, no "+", for wa.me
const WHATSAPP_DISPLAY = "+91 90301 53337";

// Resolves `host` to an IPv4 literal for nodemailer to connect to, while
// returning the original hostname as `servername` so TLS SNI / certificate
// hostname checks still validate against the real domain (a bare IP literal
// has no meaningful servername of its own — see nodemailer's
// smtp-connection `this.servername` derivation). Never throws: if IPv4
// resolution fails (e.g. the provider genuinely has no A record), falls
// back to the original hostname and lets nodemailer resolve it itself.
async function resolveConnectHost(host) {
  if (!SMTP_FORCE_IPV4 || net.isIP(host)) return { connectHost: host, servername: undefined };
  try {
    const { address } = await dns.promises.lookup(host, { family: 4 });
    return { connectHost: address, servername: host };
  } catch (err) {
    log("email", "warn", "smtp_ipv4_lookup_failed", {
      host,
      error: err?.message || String(err),
    });
    return { connectHost: host, servername: undefined };
  }
}

// Cached as a Promise (not the resolved transporter) so concurrent callers
// before the first resolution completes share one in-flight DNS lookup
// instead of racing to create duplicate transporters.
let cachedTransporterPromise = null;

async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (!cachedTransporterPromise) {
    cachedTransporterPromise = (async () => {
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== "false" : port === 465;
      const { connectHost, servername } = await resolveConnectHost(host);

      return nodemailer.createTransport({
        host: connectHost,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: CONNECTION_TIMEOUT_MS,
        ...(servername ? { tls: { servername } } : {}),
      });
    })();
  }
  return cachedTransporterPromise;
}

/** True once SMTP_* env vars are present (used for local-dev messaging only). */
export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function waLink(digits, message) {
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

// A single applicant phone (E.164, e.g. "+919000000000") -> wa.me digits.
function phoneToWaDigits(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

// "Bulletproof" table-based button: renders correctly (as a solid, tappable
// button) across Gmail/Apple Mail/Outlook.com, and degrades to a square
// (still solid-colored, still clickable) button on Outlook desktop, which
// ignores border-radius rather than losing the background entirely.
function buttonHtml({ href, label, background, color = "#ffffff", compact = false }) {
  const padding = compact ? "10px 20px" : "15px 32px";
  const fontSize = compact ? "13px" : "15px";
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 6px 10px;display:inline-block;">
      <tr>
        <td align="center" style="border-radius:8px;background:${background};">
          <a href="${href}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:${padding};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize};font-weight:700;color:${color};text-decoration:none;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function ctaRowHtml(buttons) {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr><td align="center" style="padding:4px 0 8px;">
        ${buttons.join("")}
      </td></tr>
    </table>`;
}

/**
 * Shared dark-navy/blue email shell: logo header, injected body, footer with
 * contact info + WhatsApp + legal line. `compact` tightens spacing/font
 * sizes for the internal notification email; the applicant confirmation
 * uses the spacious default.
 */
function buildEmailShell({ preheader, bodyHtml, compact = false }) {
  const headerPad = compact ? "16px 24px" : "28px 32px";
  const logoSize = compact ? "16px" : "22px";
  const footerPad = compact ? "14px 24px" : "26px 32px";
  const year = new Date().getFullYear();

  const footerContactLine = compact
    ? `Athlix lead pipeline &middot; reply to this email to reach the applicant directly.`
    : `${escapeHtml(WHATSAPP_DISPLAY)} &middot; <a href="${SITE_URL}" style="color:${TEXT_MUTED};text-decoration:underline;">athlix.in</a>`;

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>Athlix</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; background: #f4f5f7; }
  @media only screen and (max-width: 600px) {
    .email-container { width: 100% !important; border-radius: 0 !important; }
    .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#f4f5f7;">
    ${escapeHtml(preheader || "")}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!--[if mso]>
        <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0"><tr><td>
        <![endif]-->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0"
               style="width:600px;max-width:600px;background:${NAVY};border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
          <tr>
            <td class="mobile-pad" align="center" style="padding:${headerPad};border-bottom:1px solid ${BORDER_SUBTLE};">
              <span style="font-size:${logoSize};font-weight:800;letter-spacing:0.14em;color:#ffffff;">ATHLIX</span>
            </td>
          </tr>
          <tr>
            <td style="background:${NAVY_SOFT};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" align="center" style="padding:${footerPad};background:${NAVY_FOOTER};">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;">
                ${footerContactLine}
              </p>
              <p style="margin:0;font-size:11px;line-height:1.6;color:${TEXT_MUTED};font-family:Arial,Helvetica,sans-serif;">
                &copy; ${year} Athlix. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function numberedStepHtml(index, label) {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
      <tr>
        <td width="28" valign="top" style="padding-top:1px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="22" height="22" align="center" valign="middle" style="background:${BLUE};border-radius:50%;color:#ffffff;font-size:12px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">
                ${index}
              </td>
            </tr>
          </table>
        </td>
        <td valign="top" style="padding-left:10px;font-size:14px;line-height:1.6;color:${TEXT_LIGHT};font-family:Arial,Helvetica,sans-serif;">
          ${label}
        </td>
      </tr>
    </table>`;
}

// ── Applicant confirmation (premium) ────────────────────────────────────────

function confirmationContent(application) {
  const firstName = (application.name || "").split(" ")[0] || "there";
  const whatsappMessage = `Hi ${COACH_NAME}, I just applied on the Athlix website (name: ${application.name}) and wanted to check in on next steps.`;

  const text = [
    `Hi ${application.name},`,
    "",
    "Thank you for applying to Athlix! We've received your application and our team",
    "will personally review it shortly.",
    "",
    "What happens next:",
    "1. We review your application and goals.",
    "2. If it's a good fit, we'll reach out to schedule a consultation.",
    "3. We'll align on your pathway and build your personalized roadmap.",
    "",
    `Visit us: ${SITE_URL}`,
    `Chat on WhatsApp: ${waLink(WHATSAPP_DIGITS, whatsappMessage)}`,
    "",
    "If you have any questions in the meantime, just reply to this email or reach us",
    `on WhatsApp at ${WHATSAPP_DISPLAY}.`,
    "",
    `— ${COACH_NAME}, Athlix`,
  ].join("\n");

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="mobile-pad" style="padding:32px 40px 8px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 16px;font-size:17px;color:#ffffff;">Hi ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${TEXT_LIGHT};">
            Thank you for applying to <strong style="color:#ffffff;">Athlix</strong>! We've
            received your application and our coaching team will personally review it shortly.
          </p>
          <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BLUE};">
            What happens next
          </p>
          ${numberedStepHtml(1, "We review your application and goals.")}
          ${numberedStepHtml(2, "If it's a good fit, we'll reach out to schedule a consultation.")}
          ${numberedStepHtml(3, "We'll align on your pathway and build your personalized roadmap.")}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:12px 40px 8px;">
          ${ctaRowHtml([
            buttonHtml({ href: SITE_URL, label: "Visit Athlix", background: BLUE }),
            buttonHtml({
              href: waLink(WHATSAPP_DIGITS, whatsappMessage),
              label: "Chat on WhatsApp",
              background: WHATSAPP_GREEN,
            }),
          ])}
        </td>
      </tr>
      <tr>
        <td class="mobile-pad" style="padding:8px 40px 36px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:${TEXT_MUTED};">
            Questions in the meantime? Just reply to this email — it comes straight to us.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${TEXT_LIGHT};">
            &mdash; <strong style="color:${BLUE};">${escapeHtml(COACH_NAME)}, Athlix</strong>
          </p>
        </td>
      </tr>
    </table>`;

  const html = buildEmailShell({
    preheader: "Thanks for applying — here's what happens next.",
    bodyHtml,
    compact: false,
  });

  return { text, html };
}

// ── Admin notification (compact) ────────────────────────────────────────────

function detailRowsHtml(rows) {
  return rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 0;font-size:12px;color:${TEXT_MUTED};width:130px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;font-size:13px;color:${TEXT_LIGHT};vertical-align:top;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");
}

// Combines the four UTM fields into one compact "key=value, key=value" line
// instead of four separate rows — keeps the admin email dense. Omitted
// entirely (via attributionRows below) when there's nothing to show, which
// is the common case for direct/organic traffic.
function formatCampaign(application) {
  const parts = [
    ["source", application.utm_source],
    ["medium", application.utm_medium],
    ["campaign", application.utm_campaign],
    ["content", application.utm_content],
  ].filter(([, value]) => value);
  return parts.map(([key, value]) => `${key}=${value}`).join(", ");
}

// Attribution rows only appear when there's something non-empty to show, so
// the common case (direct/organic traffic, nothing set) stays fully compact.
function attributionRows(application) {
  const rows = [];
  const campaign = formatCampaign(application);
  if (campaign) rows.push(["Campaign", campaign]);
  if (application.referrer) rows.push(["Referrer", application.referrer]);
  if (application.landingPage) rows.push(["Landing Page", application.landingPage]);
  return rows;
}

function notificationContent(application, meta) {
  const rows = [
    ["Name", application.name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Gender", application.gender],
    ["Weight (kg)", application.currentWeight],
    ["Pathway", application.pathway],
    ["Challenges", application.message || "—"],
    ["IP", meta.ip || "—"],
    ...attributionRows(application),
  ];

  const text = [
    `New Athlix application: ${application.name} (${application.pathway})`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Reply to applicant: mailto:${application.email}`,
    `Message on WhatsApp: ${waLink(phoneToWaDigits(application.phone))}`,
  ].join("\n");

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetLinkHtml = spreadsheetId
    ? `<p style="margin:12px 0 0;text-align:center;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
         <a href="https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit" style="color:${BLUE};text-decoration:underline;">
           View in Google Sheet &rarr;
         </a>
       </p>`
    : "";

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="mobile-pad" style="padding:20px 28px 4px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
            <tr>
              <td style="background:${BLUE};border-radius:999px;padding:4px 12px;font-size:11px;font-weight:700;letter-spacing:0.04em;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
                NEW LEAD
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${detailRowsHtml(rows)}
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:14px 28px 4px;">
          ${ctaRowHtml([
            buttonHtml({
              href: `mailto:${application.email}`,
              label: "Reply to Applicant",
              background: BLUE_DEEP,
              compact: true,
            }),
            buttonHtml({
              href: waLink(phoneToWaDigits(application.phone)),
              label: "Message on WhatsApp",
              background: WHATSAPP_GREEN,
              compact: true,
            }),
          ])}
          ${sheetLinkHtml}
        </td>
      </tr>
      <tr><td style="padding:0 28px 18px;"></td></tr>
    </table>`;

  const html = buildEmailShell({
    preheader: `New application from ${application.name}`,
    bodyHtml,
    compact: true,
  });

  return { text, html };
}

/**
 * Notify the team inbox of a new lead. Throws on failure (missing config,
 * SMTP error) so callers can decide how to handle it.
 * @param {object} application sanitized + validated fields
 * @param {object} [meta] { ip, userAgent, submittedAt }
 */
export async function sendLeadNotification(application, meta = {}) {
  const transporter = await getTransporter();
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!transporter) {
    throw new Error("Email is not configured (SMTP_* env vars missing).");
  }
  if (!to) {
    throw new Error("Email is not configured (LEAD_NOTIFICATION_EMAIL env var missing).");
  }

  const { text, html } = notificationContent(application, meta);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: application.email,
    subject: `New application: ${application.name} — ${application.pathway}`,
    text,
    html,
  });
}

/**
 * Send the branded confirmation to the applicant. Throws on failure.
 * @param {object} application sanitized + validated fields
 */
export async function sendApplicantConfirmation(application) {
  const transporter = await getTransporter();
  if (!transporter) {
    throw new Error("Email is not configured (SMTP_* env vars missing).");
  }

  const { text, html } = confirmationContent(application);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: application.email,
    subject: "We've received your application — Athlix",
    text,
    html,
  });
}

/**
 * Send both lead emails independently (one failing never blocks the other).
 * Never throws — callers get a result summary and log/handle failures.
 * @param {object} application sanitized + validated fields
 * @param {object} [meta] { ip, userAgent, submittedAt }
 * @returns {Promise<{sent: boolean, notificationError: Error|null, confirmationError: Error|null}>}
 */
export async function sendLeadEmails(application, meta = {}) {
  const [notification, confirmation] = await Promise.allSettled([
    sendLeadNotification(application, meta),
    sendApplicantConfirmation(application),
  ]);

  return {
    sent: notification.status === "fulfilled" || confirmation.status === "fulfilled",
    notificationError: notification.status === "rejected" ? notification.reason : null,
    confirmationError: confirmation.status === "rejected" ? confirmation.reason : null,
  };
}
