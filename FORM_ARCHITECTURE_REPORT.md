# Form Architecture Report — Athlix Website

Reverse-engineering document. No code was modified to produce this report. Every claim below is traced to a specific file and line in the repository as it exists on branch `main`.

---

## 1. Project Overview

The repository is a two-package monorepo:

```
athlix-website/
├── client/   React 18 + Vite SPA (marketing site)
└── server/   Express API (Node >=18, ESM)
```

- **Client**: single-page marketing site (`client/src/App.jsx`, ~1400 lines, one file holding all sections: Hero, Coaching Method, Pathways, Coach, Certifications, Testimonials, FAQ, **Apply form**, Footer).
- **Server**: a minimal, single-purpose Express API whose *entire job* is to receive one form's submissions, validate/sanitize/rate-limit/de-dupe them, and forward the result to an operator-configured destination (webhook and/or CRM endpoint) via `fetch()`. There is no database driver, ORM, email SDK, or CRM SDK anywhere in the dependency tree.

There is **exactly one form** in the whole project: the **"Apply For Coaching"** application form. No contact form, newsletter signup, login form, or any other form exists in the codebase.

---

## 2. Form Locations

| # | Form | Component | Route/Section anchor |
|---|------|-----------|----------------------|
| 1 | Apply For Coaching | `ApplicationForm()` in `client/src/App.jsx:1012-1185` | `#apply` (rendered inside `<Coach/>`'s sibling section; mounted in the page tree via `<App/>`) |

Supporting pieces in the same file:
- `initialForm` (default field state) — `client/src/App.jsx:993-997`
- `validate()` (client-side validation) — `client/src/App.jsx:999-1010`
- `Field` (label/error wrapper component) — `client/src/App.jsx:1187-1195`
- `API_BASE` / `APPLY_ENDPOINT` constants — `client/src/App.jsx:986-987`

No other `<form>`, `useState`-driven input group, or POST call exists in `client/src/`. (`TransformationComparisonCard.jsx` is a before/after image slider — no form. `ErrorBoundary.jsx` is a React error boundary — no form.)

---

## 3. Complete Request Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│  USER                                                                    │
│  Fills out #apply form fields, clicks "Submit Application"               │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  REACT COMPONENT                                                          │
│  ApplicationForm()  — client/src/App.jsx:1012                             │
│  onSubmit() — client/src/App.jsx:1027                                     │
│  • ev.preventDefault()                                                    │
│  • inFlightRef guard (blocks double-submit / Enter-spam)                  │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  CLIENT-SIDE VALIDATION                                                   │
│  validate(values) — client/src/App.jsx:999                                │
│  Regex/range checks on name, phone, email, age, gender, currentWeight,    │
│  goal, pathway. On failure: sets `errors`, focuses first invalid field,   │
│  submission is aborted (no network call).                                 │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │ (all client checks pass)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  API CALL                                                                  │
│  fetch(APPLY_ENDPOINT, { method: "POST", ... }) — App.jsx:1041             │
│  APPLY_ENDPOINT = `${VITE_API_URL || ""}/api/apply`                       │
│  Body: { ...values, source: "athlix-website", submittedAt: ISOString }    │
│  Dev: Vite proxy forwards /api → http://localhost:8787 (vite.config.js)   │
│  Prod: same-origin /api/apply behind a reverse proxy (or VITE_API_URL)    │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │  HTTP POST /api/apply
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  BACKEND ENTRY / APP SETUP                                                 │
│  server/src/index.js → server/src/app.js: createApp()                     │
│  • helmet() security headers                                              │
│  • cors({ origin: CLIENT_ORIGIN allow-list, methods: ["POST"] })          │
│  • express.json({ limit: "16kb" })                                        │
│  • app.use("/api", createApplyRouter())                                   │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  MIDDLEWARE CHAIN (server/src/routes/apply.js:14)                          │
│  router.post("/apply",                                                    │
│    createApplyRateLimiter(),      → middleware/rateLimit.js               │
│    validateApplication,           → middleware/validate.js                │
│    handler)                                                               │
│                                                                             │
│  1. RATE LIMIT: express-rate-limit, 5 req / IP / hour (env-overridable).   │
│     Over limit → 429, logSuspicious("rate_limited"), request stops here.  │
│                                                                             │
│  2. VALIDATE (validateApplication, validate.js:65):                       │
│     a. sanitizeApplication(req.body) — lib/sanitize.js:24                 │
│        strips control chars, angle brackets, collapses whitespace,        │
│        length-caps every field, lowercases email.                         │
│     b. Honeypot check: req.isHoneypot = clean.company.length > 0          │
│     c. zod schema `applicationSchema` (validate.js:16) — full re-         │
│        validation of name/email/phone/age/weight/gender/goal/pathway/     │
│        message, independent of client checks ("never trust the client").  │
│     d. On zod failure → 400 { error, fields }, logSuspicious              │
│        ("validation_failed", { fields: [...names only] }), stops here.    │
│     e. On success → req.application = clean typed object, next()          │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  CONTROLLER (route handler body, routes/apply.js:14-46)                    │
│  • If req.isHoneypot → logSuspicious("honeypot"), return 200 { ok:true }  │
│    WITHOUT forwarding (bots get no signal of rejection).                  │
│  • isDuplicate(application) — lib/dedupe.js:28 — sha256(email|phone|goal) │
│    fingerprint seen within the last 60 minutes?                           │
│      → yes: logSuspicious("duplicate"), return 200 { ok:true,             │
│        duplicate:true } WITHOUT re-forwarding (idempotent UX).            │
│  • forwardLead(application, { ip, userAgent, submittedAt }) —             │
│    lib/forwarder.js:38 (see §5 Storage/Email/CRM below)                   │
│  • remember(application) — lib/dedupe.js:38 — ONLY after a successful     │
│    forward, so a failed delivery can be retried by the same user.         │
│  • return 200 { ok: true }                                                │
│  • On thrown error (forward failed) → console.error (server-only detail), │
│    return 502 { error: "Unable to submit right now..." } (generic).       │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  DESTINATION (lib/forwarder.js:38, forwardLead)                            │
│  Builds payload = { ...application, source, receivedAt, clientSubmitted  │
│  At, ip, userAgent }                                                      │
│  • If LEAD_WEBHOOK_URL set → POST JSON to it (Bearer LEAD_WEBHOOK_TOKEN)  │
│  • If CRM_API_URL set → POST JSON to it (Bearer CRM_API_KEY)              │
│  • Both may fire concurrently (Promise.all); BOTH must succeed or the     │
│    whole request throws → 502 to the client.                              │
│  • If NEITHER is configured → no network call; console.log the lead      │
│    (email + goal only) and return successfully. This is the actual       │
│    current production behavior unless an operator has set env vars.      │
│  There is NO database write, NO ORM, NO email-sending code (no           │
│  Nodemailer/SMTP/SendGrid/Resend/Mailgun/SES) anywhere in this repo.      │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  RESPONSE → CLIENT                                                         │
│  200 { ok:true }              → success: form resets, "Application       │
│                                   Received" screen shown (App.jsx:1047)   │
│  200 { ok:true, duplicate }   → treated identically to success by client  │
│                                   (client doesn't branch on `duplicate`)  │
│  400 { error, fields }        → field-level errors re-rendered under      │
│                                   each input, server message shown        │
│                                   (App.jsx:1056-1060)                     │
│  429 { error }                → "Too many attempts..." shown (App.jsx:1061)│
│  502/500/413 { error }        → generic serverError message shown         │
│                                   (App.jsx:1063-1067)                     │
│  network failure (fetch throw)→ generic serverError message (catch block)│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Form-by-Form Identification (per the requested 18-point checklist)

### Form: Apply For Coaching

1. **Location (file path)**: `client/src/App.jsx` — component `ApplicationForm()`, lines 1012–1185. Rendered under section `id="apply"`.
2. **API endpoint**: `/api/apply` (relative; resolved against `VITE_API_URL` if set, otherwise same-origin). Defined client-side at `client/src/App.jsx:987`.
3. **HTTP method**: `POST` only. The Express CORS config explicitly restricts `methods: ["POST"]` (`server/src/app.js:29`), and the route is `router.post("/apply", ...)` (`server/src/routes/apply.js:14`).
4. **Backend file that handles it**: `server/src/routes/apply.js` (router), wired into the app via `server/src/app.js:42` (`app.use("/api", createApplyRouter())`).
5. **"Controller" that processes it**: There is no separate controller file — the route handler function itself (`server/src/routes/apply.js:14-46`) acts as the controller, delegating to library modules (`lib/dedupe.js`, `lib/forwarder.js`, `lib/securityLog.js`).
6. **Is the data stored?** **Conditionally — depends entirely on operator-set environment variables. By default: NO persistent storage of any kind.**
   - No database write ever happens (no DB driver is even installed).
   - Data is only *transmitted onward* (not stored by this codebase) if `LEAD_WEBHOOK_URL` and/or `CRM_API_URL` are configured — and even then, storage happens on whatever *external* system receives that webhook/CRM POST, which is outside this repo.
   - If neither env var is set, the only trace of the submission is a single `console.log` line containing the applicant's email and goal (`server/src/lib/forwarder.js:60-62`) — this is stdout only, not a database.
7. **If YES, where?** Not applicable in-repo — no MongoDB / MySQL / Postgres / Google Sheets / Notion / Airtable / Firebase / Kahunas code exists. The two configurable destinations are:
   - **Webhook**: generic — any URL an operator points `LEAD_WEBHOOK_URL` at (Zapier, Make, Google Apps Script, a custom intake, etc.) — genuinely provider-agnostic; nothing provider-specific is hardcoded.
   - **CRM**: generic — any URL an operator points `CRM_API_URL` at, authenticated with a bearer token from `CRM_API_KEY`. No named CRM (HubSpot/GoHighLevel/etc.) is integrated; it is a plain `fetch()` POST to whatever URL is configured.
8. **If Email, which provider?** None. There is no email-sending code in the repository — no Nodemailer, no SMTP client, no SendGrid/Resend/Mailgun/SES SDK, no `transporter`, no `sendMail`. `nodemailer`/`SendGrid` etc. are absent from both `server/package.json` and `client/package.json`.
9. **If Database — Database / Collection / Schema / Fields / Indexes**: Not applicable — no database is connected. The closest thing to a "schema" is the **runtime validation schema** (zod), not a persistence schema:
   - File: `server/src/middleware/validate.js:16-58`
   - Fields defined: `name` (string, 2–100 chars, must contain a letter, rejects URL/handle-looking input), `email` (string, ≤254 chars, RFC email format), `phone` (regex `^[+\d][\d\s-]{6,}$` + 7–15 digit count), `age` (coerced int, 14–99), `currentWeight` (coerced number, 20–500), `gender` (enum: Male/Female/Other/Prefer not to say), `goal` (enum: Fat Loss/Body Recomposition/Muscle Gain/Lifestyle Transformation/General Fitness), `pathway` (enum: Online/Offline/Hybrid Coaching/Not Sure Yet), `message` (optional string, ≤2000 chars, default `""`).
   - This is a **request-shape contract only** — it exists to validate/reject bad input, not to define storage.
10. **If Webhook, which service?** Not a named service — a generic operator-configured URL (`LEAD_WEBHOOK_URL`), designed to accept Zapier/Make/Apps-Script/custom-intake style POSTs, per the comment in `server/src/lib/forwarder.js:6-8`. No specific webhook provider is coded against.
11. **If CRM, which CRM?** Not a named/integrated CRM SDK — a generic operator-configured URL (`CRM_API_URL`) + bearer key (`CRM_API_KEY`), POSTed via plain `fetch()`. No HubSpot/Salesforce/GoHighLevel/Kahunas-specific client code exists.
12. **Duplicate protection implemented?** **Yes.** `server/src/lib/dedupe.js`. SHA-256 fingerprint of `email|phone|goal`, kept in an **in-memory `Map`** (not Redis/DB) for a 60-minute TTL (`TTL_MS = 60 * 60 * 1000`). A repeat within the window returns `200 { ok:true, duplicate:true }` without re-forwarding. Explicitly documented as **per-process / not shared across instances** — a multi-instance deployment would not share dedupe state (`dedupe.js:9-11`).
13. **Rate limiting?** **Yes.** `express-rate-limit` in `server/src/middleware/rateLimit.js`. Default **5 requests per IP per hour**, overridable via `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` env vars. Keyed off `req.ip`, which only reflects the real client IP if `TRUST_PROXY` is correctly configured (`server/src/app.js:13-16`). Also in-memory / per-process (the default `express-rate-limit` store), same multi-instance caveat as dedupe.
14. **Validation — Client, Server, or Both?** **Both**, and the server is authoritative:
    - Client: `validate()`, `client/src/App.jsx:999-1010` — quick UX-layer regex/range checks, prevents obviously-bad submissions from even hitting the network.
    - Server: zod schema in `server/src/middleware/validate.js` — re-validates every field independently, "We NEVER trust the client" (comment at `validate.js:13-15`). The client's `onSubmit` explicitly defers to server-returned `fields` errors as the source of truth (`App.jsx:1053-1060`).
15. **Sanitization?** **Yes, server-side.** `server/src/lib/sanitize.js` — `cleanString()` strips ASCII control characters and Unicode line/paragraph separators, strips angle brackets (`<`/`>`) to defang HTML/script injection, collapses whitespace, and length-caps every field, run *before* validation and *before* forwarding. No client-side sanitization beyond native input types.
16. **CAPTCHA?** **None.** No reCAPTCHA/hCaptcha/Turnstile integration anywhere in client or server code or dependencies.
17. **Spam protection?** **Honeypot field only.** Hidden `company` input (`client/src/App.jsx:1157-1169`, `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"` — invisible/unreachable to real users but auto-filled by naive bots). If non-empty after sanitization, the server silently accepts (`200 { ok:true }`) but drops the lead without forwarding (`server/src/routes/apply.js:17-20`), and logs a `"honeypot"` security event. Combined with rate limiting and dedupe, this is the full anti-abuse surface — no CAPTCHA, no bot-behavior scoring, no IP reputation checks.
18. **Environment variables used** (all consumed server-side; the client uses only one, and it is not secret):

    | Variable | Side | Purpose | File referencing it |
    |---|---|---|---|
    | `VITE_API_URL` | Client | Optional override of API base URL (empty = same-origin) | `client/src/App.jsx:986` |
    | `PORT` | Server | Port the API listens on (default 8787) | `server/src/index.js:5` |
    | `CLIENT_ORIGIN` | Server | Comma-separated CORS allow-list | `server/src/app.js:22-25` |
    | `TRUST_PROXY` | Server | Enables `req.ip` resolution from `X-Forwarded-For` when behind a trusted proxy | `server/src/app.js:13-16` |
    | `RATE_LIMIT_MAX` | Server | Max requests per IP per window (default 5) | `server/src/middleware/rateLimit.js:13` |
    | `RATE_LIMIT_WINDOW_MS` | Server | Rate-limit window length (default 1h) | `server/src/middleware/rateLimit.js:12` |
    | `LEAD_WEBHOOK_URL` | Server (secret-adjacent) | Generic webhook destination for leads | `server/src/lib/forwarder.js:49` |
    | `LEAD_WEBHOOK_TOKEN` | Server (secret) | Bearer token sent to the webhook | `server/src/lib/forwarder.js:50` |
    | `CRM_API_URL` | Server (secret-adjacent) | Generic CRM intake destination | `server/src/lib/forwarder.js:51` |
    | `CRM_API_KEY` | Server (secret) | Bearer token sent to the CRM endpoint | `server/src/lib/forwarder.js:52` |

    Documented in `server/.env.example` and `client/.env.example`. No `.env` files are committed (only `.env.example` templates exist in the repo).

---

## 5. Storage Architecture

**There is no storage layer in this codebase.** No database client (`mongoose`, `mongodb`, `pg`, `mysql2`, `sequelize`, `prisma`, etc.) is listed in `server/package.json` dependencies, and no such import appears anywhere in `server/src/`. The full dependency list is: `cors`, `dotenv`, `express`, `express-rate-limit`, `helmet`, `zod` — none of which persist data.

The only two forms of "state" in the running server process are both **transient, in-memory, non-persistent**, and reset on every server restart:
- `dedupe.js`'s `seen` Map (submission fingerprints, 1h TTL, capacity-bounded opportunistic sweep at >5000 entries).
- `express-rate-limit`'s internal counter store (per-IP counts, default in-memory store).

Actual data persistence, if any exists, happens **entirely outside this repository**, on whatever system is behind `LEAD_WEBHOOK_URL` / `CRM_API_URL` — this code has no visibility into or control over that.

---

## 6. Email Architecture

**None exists.** No SMTP client, no Nodemailer transporter, no third-party email API client (SendGrid/Resend/Mailgun/AWS SES) is present in dependencies or source. The word "Email" appears in this codebase only in the `emailDomain()` helper (`server/src/lib/securityLog.js:17-21`), which extracts the domain portion of a submitted email address purely for **anonymized security logging** (e.g., `"gmail.com"` in a log line) — it sends no email and is unrelated to any mail-delivery mechanism. If the applicant is ever notified by email today, it happens on whatever external system consumes the webhook/CRM POST — not in this code.

---

## 7. Database Architecture

**None exists.** No schema files, no migrations, no ORM models, no connection strings beyond the placeholder `.env.example` entries (which are for a webhook/CRM URL, not a database). See §5.

---

## 8. CRM Architecture

**Generic, not integrated with a named CRM.** `server/src/lib/forwarder.js` optionally POSTs the exact same JSON payload to a second configurable URL (`CRM_API_URL`) with an `Authorization: Bearer ${CRM_API_KEY}` header if set — functionally identical in shape to the webhook path, just a second potential destination fired concurrently. Nothing in the code is specific to HubSpot, GoHighLevel, Salesforce, Kahunas, or any other named CRM; those would only come into play if an operator pointed `CRM_API_URL` at that vendor's intake endpoint (using whatever auth scheme that vendor expects — which a plain Bearer header may or may not match, depending on the vendor).

---

## 9. Environment Variables

See the table in §4, item 18. Summary by system:

- **Client build-time**: `VITE_API_URL` (public, non-secret).
- **Server runtime — network/CORS/limits**: `PORT`, `CLIENT_ORIGIN`, `TRUST_PROXY`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.
- **Server runtime — lead delivery (secrets)**: `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN`, `CRM_API_URL`, `CRM_API_KEY`.

---

## 10. Security Analysis (as implemented, no judgment on sufficiency)

| Control | Present? | Mechanism | File |
|---|---|---|---|
| HTTPS/security headers | Yes | `helmet()` | `server/src/app.js:19` |
| CORS allow-list | Yes | explicit origin list from `CLIENT_ORIGIN`, POST-only, no origins = block all | `server/src/app.js:22-33` |
| Body size cap | Yes | `express.json({ limit: "16kb" })` | `server/src/app.js:36` |
| Rate limiting | Yes | 5/IP/hour, in-memory | `server/src/middleware/rateLimit.js` |
| Input sanitization | Yes | strip control chars + `<>`, length caps | `server/src/lib/sanitize.js` |
| Server-side validation | Yes | zod, independent of client | `server/src/middleware/validate.js` |
| Honeypot anti-bot | Yes | hidden `company` field | `App.jsx:1157-1169`, `validate.js:70` |
| Duplicate-submission protection | Yes | SHA-256 fingerprint, 1h TTL, in-memory | `server/src/lib/dedupe.js` |
| CAPTCHA | No | — | — |
| Secrets isolation | Yes | webhook/CRM tokens read only server-side via `process.env`, never sent to client | `server/src/lib/forwarder.js:49-52` |
| Generic error responses | Yes | no stack/internal detail ever returned to client | `server/src/middleware/errorHandler.js`, route catch block |
| PII-minimized logging | Yes | `logSuspicious()` logs email **domain** only, never full email/phone/name/message | `server/src/lib/securityLog.js` |
| Source-map suppression | Yes | `sourcemap: false` in production build | `client/vite.config.js:9-12` |
| CSP / frame / HSTS headers | Yes | set at hosting layer | `client/vercel.json` |
| Timeout on outbound forward | Yes | 8s `AbortController` timeout per destination | `server/src/lib/forwarder.js:10,13-14` |
| Cross-instance shared state for rate-limit/dedupe | No | both are per-process in-memory (explicitly documented as a known limitation, not a gap the code hides) | `dedupe.js:9-11`, default `express-rate-limit` store |

---

## 11. What Happens After the User Clicks "Submit" (plain-language walkthrough)

1. The click is intercepted (`preventDefault`); if a submission is already in flight, this click is ignored.
2. The browser re-checks every field against `validate()`'s regexes/ranges. Any failure stops here — nothing is sent, the first invalid field is focused, and inline error text appears.
3. If the client-side checks pass, the whole form (including the invisible honeypot `company` field, which is always empty for a real user) is JSON-POSTed to `/api/apply`, tagged with a `source` string and an ISO submission timestamp.
4. The request first passes through the rate limiter (silently counted against that IP's 5-per-hour budget).
5. The server strips any control characters/HTML angle-brackets from every field and re-validates everything from scratch with zod — the same rules as the client, but authoritative.
6. If validation fails server-side, a `400` comes back with a safe `{ field: message }` map, which the React form merges into its own error state and displays — the user sees essentially the same experience as a client-side validation failure, just round-tripped.
7. If the (sanitized) honeypot field is non-empty, the server pretends success (`200`) but silently discards the submission — the "bot" gets no signal that anything went wrong.
8. If this exact `email|phone|goal` combination was already submitted in the last hour, the server again returns success but does not forward it a second time.
9. Otherwise, the server builds a payload (the cleaned form fields + `source`, `receivedAt`, the client's `submittedAt`, the requester's `ip`, and `userAgent`) and POSTs it — with an 8-second timeout — to whichever of `LEAD_WEBHOOK_URL` / `CRM_API_URL` are configured in the server's environment. If neither is configured (e.g. local development, or a production deploy where the operator hasn't filled these in yet), the lead is only written to the server's console log (email + goal) and the request is still treated as a success.
10. Only after a successful forward does the server remember this fingerprint for the 1-hour dedupe window.
11. The server replies `200 { ok: true }`. The React form clears itself, sets `done = true`, and swaps to the "Application Received" success panel with a "Submit another application" button.
12. If step 9's forward throws (destination down, timeout, non-2xx), the server responds `502` with a generic message; the form shows that message inline but does not clear the user's input, so they can retry without retyping.

---

## 12. Exactly Where Every Field Finally Ends Up

| Field | Client state key | Sanitized (server) | Validated (server, zod) | Included in outbound payload? | Persisted in this repo's infrastructure? |
|---|---|---|---|---|---|
| Full Name | `values.name` | Yes — control chars/`<>` stripped, ≤100 chars | Yes — 2–100 chars, must contain a letter, rejects URL-looking input | Yes | No (forwarded only, if a destination is configured) |
| Phone | `values.phone` | Yes — ≤30 chars | Yes — format + 7–15 digit count | Yes | No |
| Email | `values.email` | Yes — ≤254 chars, lowercased | Yes — RFC email format, ≤254 chars | Yes | No (only its **domain** may appear in server logs on suspicious events) |
| Age | `values.age` | Yes — ≤3 chars | Yes — coerced int, 14–99 | Yes | No |
| Gender | `values.gender` | Yes — ≤30 chars | Yes — enum allow-list | Yes | No |
| Current Weight (kg) | `values.currentWeight` | Yes — ≤20 chars | Yes — coerced number, 20–500 | Yes | No |
| Primary Goal | `values.goal` | Yes — ≤60 chars | Yes — enum allow-list | Yes (also used as part of the dedupe fingerprint) | No |
| Coaching Pathway | `values.pathway` | Yes — ≤60 chars | Yes — enum allow-list | Yes | No |
| Message (optional) | `values.message` | Yes — ≤2000 chars | Yes — optional, ≤2000 chars, defaults to `""` | Yes | No |
| Company (honeypot) | `values.company` | Yes — ≤100 chars | Not part of the typed schema; checked separately (`length > 0` ⇒ bot) | No — submission is dropped entirely if non-empty | No |
| `source` | hardcoded `"athlix-website"` (client) | — | — | Yes, plus the server re-sets its own `source: "athlix-website"` in the outbound payload | No |
| `submittedAt` | `new Date().toISOString()` (client) | — | — | Yes, as `clientSubmittedAt` | No |
| `ip` / `userAgent` | n/a (server-derived from the request) | — | — | Yes, added by `forwardLead()` | No |
| `receivedAt` | n/a (server timestamp) | — | — | Yes, added by `forwardLead()` | No |

**Final resting place of every field**: an outbound `fetch()` POST body sent to `LEAD_WEBHOOK_URL` and/or `CRM_API_URL` if configured; otherwise, only the `email` and `goal` values reach a `console.log` line, and nothing else is retained anywhere once the HTTP response is sent.

---

## 13. Final Architecture Diagram

```
                                   ATHLIX FORM ARCHITECTURE (AS-IS)

┌───────────────────────────┐
│        Browser            │
│  ┌──────────────────────┐ │
│  │ ApplicationForm()     │ │
│  │ App.jsx:1012          │ │
│  │  - values (useState)  │ │
│  │  - validate()         │ │  client-side regex/range checks
│  │  - honeypot: company  │ │  hidden field, aria-hidden, tabIndex=-1
│  └──────────┬─────────────┘ │
└─────────────┼───────────────┘
              │ fetch POST JSON
              ▼
      /api/apply  (same-origin in prod via reverse proxy,
                    or Vite dev-proxy → localhost:8787,
                    or VITE_API_URL if cross-origin)
              │
              ▼
┌───────────────────────────────────────────────────────────────┐
│                     Express Server (server/src)                 │
│  app.js: helmet() → cors(allow-list) → json({limit:16kb})       │
│                                                                   │
│  routes/apply.js  POST /api/apply                                │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 1. rateLimit.js     5 req / IP / hour (in-memory)         │  │
│   │ 2. validate.js      sanitize.js → zod schema               │  │
│   │      → honeypot flag set here                              │  │
│   │ 3. route handler:                                          │  │
│   │      honeypot? → 200 ok, DROP                              │  │
│   │      dedupe.js  → seen in last 1h? → 200 ok, DROP           │  │
│   │      forwarder.js → fetch() out, 8s timeout                │  │
│   │      dedupe.js  → remember() after success                 │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                   │
│   securityLog.js: logSuspicious() on honeypot / duplicate /       │
│   validation_failed / rate_limited / bad_json / oversized —       │
│   structured JSON to stdout, email DOMAIN only, no PII body       │
└───────────────────────────┬───────────────────────────────────┘
                             │
              ┌──────────────┴───────────────┐
              │                               │
    LEAD_WEBHOOK_URL configured?     CRM_API_URL configured?
              │ yes                           │ yes
              ▼                               ▼
   ┌─────────────────────┐        ┌─────────────────────┐
   │  Generic webhook     │        │  Generic CRM intake  │
   │  (operator-chosen:   │        │  (operator-chosen,   │
   │  Zapier/Make/Apps    │        │  Bearer CRM_API_KEY) │
   │  Script/etc., Bearer │        │  — outside this repo │
   │  LEAD_WEBHOOK_TOKEN) │        │                       │
   │  — outside this repo │        └─────────────────────┘
   └─────────────────────┘

              If NEITHER configured:
              console.log(email, goal) only — no persistence anywhere.

   No database. No email SDK. No named CRM SDK. No CAPTCHA.
   Only in-memory, per-process state: rate-limit counters + dedupe fingerprints.
```

---

## Summary Table (quick reference)

| Question | Answer |
|---|---|
| Number of forms in project | 1 ("Apply For Coaching") |
| Form file | `client/src/App.jsx` (`ApplicationForm`, lines 1012–1185) |
| Endpoint | `POST /api/apply` |
| Backend file | `server/src/routes/apply.js` |
| Controller | inline route handler (no separate controller layer) |
| Database used | None |
| Email provider used | None |
| CRM integrated | None named — generic configurable endpoint only |
| Webhook | Generic, operator-configured via `LEAD_WEBHOOK_URL` |
| Data ever stored in-repo | No — only transient in-memory dedupe/rate-limit state |
| Validation | Both client (UX) and server (authoritative, zod) |
| Sanitization | Server-side (`sanitize.js`) |
| CAPTCHA | None |
| Spam protection | Honeypot field + rate limiting + duplicate detection |
| Rate limiting | 5 requests / IP / hour |
| Duplicate protection | SHA-256(email\|phone\|goal), 1-hour TTL, in-memory |
