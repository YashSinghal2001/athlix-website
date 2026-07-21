# Athlix Backend API

Secure submission API for the "Apply For Coaching" form. The React/Vite client
posts to `POST /api/apply`; this server validates, sanitizes, rate-limits,
de-dupes, verifies Cloudflare Turnstile, and delivers the lead to
**Google Sheets** and via **email** using **server-side secrets only**. The
browser never sees any key.

## Run

```bash
cd server
cp .env.example .env      # fill in GOOGLE_SHEETS_* / SMTP_* for production
npm install
npm run dev               # http://localhost:8787  (or npm start)
```

With no `GOOGLE_SHEETS_*` / `SMTP_*` configured, submissions are accepted and
logged only (handy for local development).

## Environment variables

All configuration is read from `process.env` — nothing is hardcoded in
source. See `.env.example` for the full, commented reference; the table
below is a quick summary. For a full production deployment walkthrough see
[`DEPLOYMENT.md`](./DEPLOYMENT.md).

| Variable | Required? | Purpose |
|---|---|---|
| `PORT` | Yes | Port the API listens on. |
| `CLIENT_ORIGIN` | Yes | Comma-separated allowed browser origin(s) for CORS. Empty = block all cross-origin requests. |
| `TRUST_PROXY` | No | Set when behind a reverse proxy, so rate limiting sees the real client IP. Defaults to `1` automatically on Render (`RENDER=true`); set explicitly (including `0`) to override. |
| `RATE_LIMIT_MAX` | No | Max submissions per IP per window. Default `5`. |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window in ms. Default `3600000` (1h). |
| `APP_VERSION` | No | Version string reported by `GET /health`. Defaults to `package.json`'s `version`. Not a secret. |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | For Sheets channel | Target spreadsheet ID. |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | For Sheets channel | Service account client email. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | For Sheets channel | Service account private key (PEM, `\n`-escaped). |
| `GOOGLE_SHEETS_SHEET_NAME` | For Sheets channel | Sheet/tab name leads are appended to. |
| `SMTP_HOST` | For email channel | SMTP server hostname (e.g. Hostinger's). |
| `SMTP_PORT` | For email channel | SMTP port (465 or 587). |
| `SMTP_SECURE` | For email channel | `true` for implicit TLS (465), `false` for STARTTLS (587). |
| `SMTP_USER` | For email channel | SMTP auth username / mailbox address. |
| `SMTP_PASS` | For email channel | SMTP auth password. |
| `SMTP_FROM` | No | Overrides the `From` header; defaults to `SMTP_USER`. |
| `SMTP_FORCE_IPV4` | No | Resolves `SMTP_HOST` to an IPv4 address before connecting. Default `true` — works around platforms (e.g. Render) that resolve an SMTP provider's AAAA record but have no outbound IPv6 route, causing `connect ENETUNREACH <ipv6>`. Set to `false` only if your SMTP provider requires IPv6. |
| `LEAD_NOTIFICATION_EMAIL` | For notification email | Inbox that receives new-lead notifications. |
| `TURNSTILE_SECRET_KEY` | No (but see below) | Enables server-side Cloudflare Turnstile verification. |

"For Sheets channel" / "For email channel" means: that whole group must be
set together to enable the channel; if any variable in the group is missing,
the channel is skipped (not a failure) — see **Lead processing** below.
`LEAD_NOTIFICATION_EMAIL` gates only the internal notification email; the
applicant confirmation email still sends without it as long as the SMTP
group is configured.

**Never commit `.env`.** `CLIENT_ORIGIN` is the only value the browser needs
to know indirectly (it must match where the client is hosted) — every other
variable here is a server-side secret or server-only setting and must never
be prefixed `VITE_` or referenced from `client/`.

## Endpoints

### `GET /health`

Liveness probe for load balancers / uptime monitors. Always `200` if the
process is up. Deliberately minimal — no config or env values are exposed:

```json
{
  "status": "ok",
  "uptime": 1234.56,
  "timestamp": "2026-07-21T08:34:42.056Z",
  "version": "1.0.0"
}
```

- `uptime` — seconds the process has been running (`process.uptime()`).
- `version` — `APP_VERSION` if set, else `package.json`'s `version`.

### `POST /api/apply`

JSON body:

```json
{
  "name": "Jane Doe",
  "phone": "+919000000000",
  "email": "jane@example.com",
  "gender": "Female",
  "currentWeight": "72",
  "pathway": "Hybrid Coaching",
  "message": "optional",
  "company": "",            // honeypot — must stay empty
  "turnstileToken": ""      // Cloudflare Turnstile response token, if enabled
}
```

`phone` is a full E.164 number (with country code) from the frontend's
country-select phone input, validated with `libphonenumber-js`.

Responses are intentionally **generic**:
- `200 { ok: true }` — accepted (also returned for honeypot hits and duplicates)
- `400 { error: "Invalid submission." }` — failed validation
- `403 { error: "Verification failed. ..." }` — Turnstile verification failed (only when `TURNSTILE_SECRET_KEY` is set)
- `429 { error: "Too many requests. ..." }` — rate limit (5 / IP / hour)
- `502 { error: "Unable to submit right now. ..." }` — every configured delivery channel failed

## Bot protection

Layered, in this order (see `routes/apply.js`):

1. **Rate limiting** — 5 submissions / IP / hour (`middleware/rateLimit.js`).
2. **Schema validation + sanitization** — every field independently
   validated server-side (`middleware/validate.js`, `lib/sanitize.js`).
3. **Honeypot** — the `company` field; real users never see or fill it
   (`client/src/App.jsx` keeps it hidden). Checked first among the
   in-request checks below since it's free — a confirmed bot never costs a
   Turnstile API call.
4. **Cloudflare Turnstile** (`lib/turnstile.js`) — the client solves an
   invisible challenge and sends the resulting token; the server verifies
   it directly with Cloudflare's `siteverify` API before proceeding. A
   failure here returns `403`, distinct from the honeypot's silent `200`,
   since a legitimate user's token can also fail (expired, reused) and
   deserves a message that lets them retry — unlike a confirmed bot, who
   gets no signal either way.
5. **Duplicate-submission protection** — same lead within the TTL window
   (`lib/dedupe.js`).

None of these were replaced or weakened by adding Turnstile — it's a fifth
layer, not a substitute for the others. Turnstile itself is optional: if
`TURNSTILE_SECRET_KEY` isn't set, step 4 is skipped entirely (not a
failure), matching this project's "frictionless local dev" pattern for
optional integrations (Google Sheets, email) — steps 1–3 and 5 are always
active regardless. The client mirrors this: if `VITE_TURNSTILE_SITE_KEY`
isn't set (or the Turnstile script fails to load), it just sends an empty
token and lets the server decide.

The Turnstile widget renders with `size: "invisible"` — it adds no visible
UI, so the form's design is unaffected either way.

## Lead processing

On a successful, non-duplicate, non-honeypot submission, `routes/apply.js`
delivers the lead to two independent channels, each implemented as a
reusable, side-effect-only module:

| Module | Responsibility |
|---|---|
| `lib/googleSheets.js` | Appends the lead as a row to a Google Sheet (service account auth). |
| `lib/email.js` | Sends a notification email to the team inbox + a branded confirmation email to the applicant, over Hostinger SMTP. |

### Google Sheets columns

`lib/googleSheets.js` bootstraps the target tab (`GOOGLE_SHEETS_SHEET_NAME`)
on first use if it doesn't already exist, and writes this exact header row
(`SHEET_HEADERS` in that file) if row 1 is empty:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Date | Full Name | Country | Country Code | Mobile Number | Email | Gender | Current Weight (kg) | Preferred Coaching Pathway | Challenges | Source | Status |

- **Date** is formatted `DD/MM/YYYY` only (no time) in the `Asia/Kolkata`
  timezone (IST), regardless of the server's own timezone.
- **Country**, **Country Code**, and **Mobile Number** are split from the
  single E.164 `phone` value (e.g. `+919030153337`) using
  `libphonenumber-js`'s structured parser (`parsePhoneNumber`) — the same
  library that already validates the number in `middleware/validate.js` —
  plus `Intl.DisplayNames` to resolve the ISO country code to a display
  name. No regex parsing is involved. Example: `phone: "+919030153337"` ->
  `Country: "India"`, `Country Code: "+91"`, `Mobile Number: "9030153337"`.
- **Source** is currently always `"Website"`.
- **Status** defaults to `"New"` on insert (`STATUS_OPTIONS[0]` in
  `lib/googleSheets.js`) and is restricted in the sheet itself to a dropdown
  of `STATUS_OPTIONS`: **New, Called, Converted, Rejected, Follow Up**.
  Update it per-row in the sheet as a lead moves through the pipeline — the
  dropdown (Sheets data validation, `strict: true`) prevents typos/other
  values from being entered in that column.
- **UTM Source/Medium/Campaign/Content, Referrer, Landing Page, and IP are
  no longer written to the sheet.** They're still captured client-side and
  used for marketing-attribution rows in the internal notification email
  (see **Email design** below) — this schema is Sheets-specific.
- Headers are only ever written via a fixed-range overwrite, never an
  insert/append, so a header row can never be duplicated — concurrent
  first-requests are safe.
- New columns are always appended at the **end** of `SHEET_HEADERS`, never
  inserted in the middle — that's what makes the header row safely
  upgradable: if row 1 is a strict prefix of the current `SHEET_HEADERS`,
  `ensureHeaderRow()` backfills only the missing trailing columns, never
  touching the existing ones — so pre-existing data rows stay correctly
  aligned under their original headers.
- **Legacy schema migration:** a sheet still on the retired first schema
  (column A titled `"Timestamp"`, with a single `Phone` column and the old
  UTM/Referrer/Landing Page/IP columns) is detected automatically and its
  header row is rewritten to the new schema above in a single atomic write
  — any now-unused trailing legacy columns are blanked out at the same
  time. This **only ever touches row 1**: no data row is deleted, moved, or
  rewritten, so nothing is corrupted and no second sheet/tab is ever
  created. Rows written *before* migration keep their old shape under the
  new headers (e.g. the old single `Phone` value ends up sitting under
  `Country`) — an inherent tradeoff of a column-order change. Every row
  appended *after* migration uses the new layout correctly. If row 1 has
  any other content that isn't a recognized shape (not blank, not the
  current schema, not a prefix of it, not the legacy marker), it's left
  untouched entirely.
- The Status dropdown, unlike headers, is (re)applied any time a tab isn't
  yet cached as ready — including a tab that already existed (with data)
  before this feature shipped — since re-applying the same validation rule
  to the same range is an overwrite, not an insert, so it's safe to repeat.
- Once a tab is confirmed ready (header + dropdown), that check is cached
  for the life of the process — later appends skip straight to writing the
  data row.

### Email design

Both emails share one dark-navy/blue "Athlix" HTML shell (`buildEmailShell`
in `lib/email.js`) — logo wordmark header, blue accent color (`#0A66FF`,
matching the site's `athlix-blue`), a CTA button, a WhatsApp button, and a
footer with contact info — so every outgoing email is visually consistent.
The two templates differ in weight, not branding:

- **Applicant confirmation** — spacious/premium: numbered "what happens
  next" steps, a "Visit Athlix" CTA button, and a "Chat on WhatsApp" button
  (pre-filled message) linking to the business's own WhatsApp number.
- **Admin notification** — compact: a dense details table, a "Reply to
  Applicant" button (`mailto:` the applicant), a "Message on WhatsApp"
  button that opens a chat with the **applicant's own phone number** (handy
  for the coach to reach out immediately), and — if
  `GOOGLE_SHEETS_SPREADSHEET_ID` is set — a "View in Google Sheet" link.
  Marketing attribution (see above) only adds rows when there's something to
  show: a combined "Campaign" row (`source=..., medium=..., campaign=...,
  content=...`) plus "Referrer" and "Landing Page" rows, each omitted
  individually when empty — direct/organic leads (the common case) don't
  grow the email at all. The applicant confirmation never includes any of
  this.

Both are responsive (fluid width, a `max-width:600px` container, a mobile
media query, and an Outlook/MSO conditional wrapper) and use a table-based
"bulletproof button" pattern so CTAs render as solid, tappable buttons across
Gmail, Apple Mail, and Outlook. The site's WhatsApp number and `athlix.in`
URL are brand-identity constants in `lib/email.js` (same number as the
site's own "Book Consultation" CTA), not environment variables — Hostinger
SMTP delivery itself is unchanged and still fully configured via `SMTP_*`.

Fault tolerance rules (so **one failing integration never loses a lead**):
- Each channel is attempted only if its env vars are configured; an
  unconfigured channel is skipped, not counted as a failure.
- If **Google Sheets fails but email succeeds** — the error is logged, the
  submission still returns success.
- If **email fails but Google Sheets succeeds** — the error is logged, the
  submission still returns success.
- If **every configured channel fails** (or, for the notification/confirmation
  pair inside `lib/email.js`, both emails fail), the failure is logged and the
  route returns `502` so the client can retry — this is the one case where the
  lead would otherwise be lost.
- If **neither channel is configured** (e.g. local dev), the submission is
  accepted and logged only.

## Logging

Every log line is structured (`[category] {flat JSON}`) and human-readable —
grep by category (e.g. `grep '\[sheets\]'`) or pipe through `jq` for
machine parsing. Two modules produce these lines with two deliberately
different privacy policies:

| Module | Categories | PII policy |
|---|---|---|
| `lib/logger.js` | `submission`, `sheets`, `email` | Includes the applicant's **email address** — needed to trace and follow up on a specific lead's delivery outcome. Never phone, name, or message. |
| `lib/securityLog.js` | `security` (events: `validation_failed`, `honeypot`, `duplicate`, `rate_limited`, `bad_json`, `payload_too_large`) | Abuse/anti-bot signals — logs only the email **domain**, IP, path, and user agent. Never a full email/phone/name. |

Events emitted, mapped to the six required log areas:

| Area | Event(s) | Level |
|---|---|---|
| Form submission | `submission_received`, `submission_accepted`, `submission_failed` | info / info / error |
| Validation failure | `validation_failed` (field names only, never values) | warn |
| Google Sheets | `sheets_saved`, `sheets_failed` | info / error |
| Email | `email_notification_sent`, `email_notification_failed`, `email_confirmation_sent`, `email_confirmation_failed`, `smtp_ipv4_lookup_failed` | info / error / info / error / warn |
| Duplicate detection | `duplicate` | info |
| Rate limiting | `rate_limited` | warn |
| Bot protection | `turnstile_failed` (`security` category, not `submission`) | warn |

If both Sheets and email fail for the same submission, `submission_failed`'s
own message names each configured channel and its underlying error (e.g.
`All configured lead delivery channels failed (sheets: ...; email: connect
ENETUNREACH ...)`) — no need to cross-reference the earlier `sheets_failed`/
`email_notification_failed` lines to tell which channel(s) caused it.
Turnstile failures never reach this path (they 403 immediately and are only
ever logged as `turnstile_failed`), so a `submission_failed` line is always a
Sheets and/or SMTP failure.

Both logging modules **never log secrets**: `lib/logger.js` redacts any
field whose name looks credential-shaped (`pass`, `secret`, `token`,
`*_key`, `authorization`) before writing the line, as a defense-in-depth
backstop on top of call sites simply never passing credentials in. Neither
module ever logs `SMTP_PASS`, `GOOGLE_SHEETS_PRIVATE_KEY`, or any other
`.env` value.

## Error monitoring (Sentry)

All logging above is unchanged and keeps working exactly as before. Sentry
(`@sentry/node`) is purely additive: it reports exceptions to a dashboard for
alerting, on top of the existing console logs, not instead of them.

- **Setup**: `src/instrument.js`, imported first thing in `src/index.js`
  (before `app.js`) so Sentry's Node auto-instrumentation can hook core
  modules before Express is loaded.
- **What's captured**:
  - Uncaught Express errors — `Sentry.setupExpressErrorHandler(app)` in
    `src/app.js`, registered after the routes and before the app's own
    `errorHandler`. Its default filter only reports 500-shaped errors, so
    the deliberately-handled `413`/`400` cases (oversized payload,
    malformed JSON) are never sent — those stay exactly what they were:
    `logSuspicious()` events, not exceptions.
  - Delivery failures that are caught and logged but never thrown further
    (Google Sheets, email notification/confirmation, and the "all channels
    failed" case) — explicit `Sentry.captureException(err)` calls placed
    next to the existing `log(...)` calls in `routes/apply.js`.
- **Environment gating**: events are sent **only** when both `SENTRY_DSN`
  is set **and** `NODE_ENV=production` — see `.env.example`. Local dev and
  the smoke test never send events, even with a DSN configured, since
  `NODE_ENV` isn't `production` in either. Leaving `SENTRY_DSN` empty
  disables this entirely (same "frictionless local dev" pattern as Google
  Sheets/email/Turnstile).
- **Not captured, on purpose**: `lib/securityLog.js` events
  (`rate_limited`, `honeypot`, `turnstile_failed`, `validation_failed`,
  etc.) are expected abuse-traffic signals, not bugs — sending them to
  Sentry would just be noise on top of what `[security] {...}` log lines
  already surface for that purpose.

## Security controls

| Control | Where |
|---|---|
| Field validation (allow-lists, formats) | `middleware/validate.js` (zod) |
| Input sanitization (strip control chars / `<>`, length caps) | `lib/sanitize.js` |
| Rate limiting (5/IP/hour) | `middleware/rateLimit.js` |
| Honeypot (`company` field) | `middleware/validate.js` + route |
| Cloudflare Turnstile verification | `lib/turnstile.js` + route (see **Bot protection**) |
| Duplicate-submission protection (1h fingerprint) | `lib/dedupe.js` |
| Secrets server-side only | `lib/googleSheets.js`, `lib/email.js`, `lib/turnstile.js` + `.env` |
| Security headers / CORS / body-size cap | `app.js` (helmet, cors, json limit) |
| Generic errors (no stack/details leaked) | `middleware/errorHandler.js` |

## Production notes

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full production deployment
checklist (hosting options, secrets management, reverse-proxy setup, and a
pre-launch checklist). Summary:

- Set `TRUST_PROXY=1` only when behind a proxy you control (so rate limiting
  uses the real client IP) — this is automatic on Render.
- Set `CLIENT_ORIGIN` to your site origin(s) for CORS.
- Duplicate protection is in-memory (per process). For multiple instances,
  back `lib/dedupe.js` with Redis (`SETEX`) — same interface.
- Share the Google Sheet with the service account's client email (Editor
  access) or `lib/googleSheets.js` will fail with a permissions error.
- `remember()` (duplicate protection) only runs after a successful delivery,
  so a total failure (`502`) is safely retryable by the client.

## Lint / build

```bash
npm run lint    # eslint .
npm run build   # syntax-checks every source file (no bundler needed)
```

## Smoke test

```bash
npm run test:smoke
```
