# Deploying the Athlix Backend

This document covers taking `server/` from local development to a
production deployment. It does not cover the `client/` static build — see
the root `README.md` / `client/README.md` for that. **This document does not
perform a deployment; it only documents what deploying safely requires.**

## 1. What this server needs from its environment

The server reads **all** configuration from `process.env` — there is no
hardcoded host, port, credential, or business value in source. Before
deploying, prepare real values for every variable in `server/.env.example`
and load them into your hosting platform's environment/secrets store (never
into a file committed to git).

### Required in every environment

| Variable | Notes |
|---|---|
| `PORT` | Many PaaS providers (Render, Railway, Heroku) inject this automatically — don't hardcode it in your process manager if so. |
| `CLIENT_ORIGIN` | Must exactly match the origin(s) the client is served from (scheme + host, no path). Comma-separate multiple origins. Left empty, the API rejects all cross-origin requests. |

### Required to enable Google Sheets lead capture

`GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`,
`GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SHEET_NAME` — all four, together.
See `.env.example` for the exact setup steps (service account, API
enablement, sharing the sheet). If any one is missing, this channel is
skipped entirely (treated as "not configured", not as a failure).

### Required to enable email (notification + applicant confirmation)

`RESEND_API_KEY` and `EMAIL_FROM` — both together, from your
[Resend](https://resend.com) account. `EMAIL_FROM` must be a verified
sender/domain in Resend. `ADMIN_EMAIL` is required specifically for the
internal notification email — without it, that one email is skipped/logged
as a failure but the applicant confirmation email still sends normally.

### Optional tuning

`TRUST_PROXY`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` — sane defaults exist
in code; only set these to override them. See `.env.example` for defaults.
`TRUST_PROXY` defaults to `1` automatically on Render (detected via Render's
own `RENDER=true` environment variable) since Render's edge always sits
exactly one hop in front of the app — set `TRUST_PROXY` explicitly (including
`0`) to override.

### Optional: error monitoring (Sentry)

`SENTRY_DSN` (server) — see **Error monitoring (Sentry)** in `server/README.md`
for exactly what's captured. Requires **both** `SENTRY_DSN` and
`NODE_ENV=production` to be set before any event is sent; most platforms
(including Railway) do **not** set `NODE_ENV` automatically, so it must be
added explicitly alongside `SENTRY_DSN` in your platform's variables. Leave
`SENTRY_DSN` unset to disable entirely.

**At least one of the two lead-delivery channels (Google Sheets or email)
should be fully configured in production** — otherwise submissions are
accepted and only logged to stdout, and every lead is lost the moment logs
roll over.

## 2. Secrets handling

- Put real values in your platform's secret/environment manager (e.g.
  Vercel/Render/Railway "Environment Variables", a `.env` file that is
  **git-ignored** and deployed out-of-band, or a secrets manager like AWS
  Secrets Manager / Doppler / 1Password). Never commit `.env`.
- `GOOGLE_SHEETS_PRIVATE_KEY` and `RESEND_API_KEY` are credentials — treat
  them with the same care as a database password. Rotate them if they are
  ever pasted into a chat, ticket, or log.
- Nothing server-side is ever sent to the browser. The only thing the
  frontend needs to know is the API's origin (`VITE_API_URL` in
  `client/.env`, itself optional if the API is same-origin behind a reverse
  proxy) — never mirror a server secret into a `VITE_`-prefixed variable.
- Application logs (`console.log`/`console.error`) never print full
  credentials; they log error messages and, for the security log, only an
  email **domain** (never the full address) — see `lib/securityLog.js`.

## 3. Running the process

```bash
cd server
npm install --omit=dev
npm run build   # syntax-checks every source file — run this in CI before deploy
npm start        # node src/index.js
```

Use a process manager / platform that:
- restarts the process on crash (PM2, systemd, or your PaaS's built-in
  supervisor),
- injects environment variables at the process level (not baked into an
  image layer that ends up in a public registry),
- terminates TLS in front of the app (see reverse proxy notes below) — this
  server does not terminate TLS itself.

The server already handles `SIGINT`/`SIGTERM` for graceful shutdown
(`src/index.js`), so standard container/orchestrator stop signals work
without extra wiring.

## 4. Reverse proxy / TLS

Run this server behind a reverse proxy (Nginx, Caddy, or your platform's
managed edge) that terminates TLS and forwards to `PORT`. Reference configs
already exist for the frontend at `client/deploy/nginx.conf` and
`client/deploy/security-headers.conf` — extend that proxy to also route
`/api/*` to this server, or run it as a separate origin and set
`VITE_API_URL` in the client accordingly.

If you do put this server behind a reverse proxy, set `TRUST_PROXY` to `1`
(or the correct hop count) so `req.ip` reflects the real client IP and rate
limiting can't be trivially bypassed by spoofing `X-Forwarded-For`. Only do
this when you control the proxy — never set it when the server is exposed
directly to the internet. On Render this is automatic (`app.js` detects
Render's own `RENDER=true` variable and defaults `TRUST_PROXY` to `1`),
since Render's edge is always exactly one trusted hop away; leaving it unset
elsewhere without a reverse proxy correctly fails closed. Without this,
Render's edge injects `X-Forwarded-For` on every request while Express's
`trust proxy` is disabled by default, and `express-rate-limit` refuses to
start with `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`.

## 5. Scaling notes

- Rate limiting (`middleware/rateLimit.js`) and duplicate-submission
  protection (`lib/dedupe.js`) are both **in-memory, per process**. Running
  more than one instance behind a load balancer means each instance has its
  own counters — a client could get `5 × instance count` submissions through
  before being limited, and duplicate detection only catches repeats that
  land on the same instance.
  - For multi-instance deployments, back both with a shared store (Redis is
    a natural fit — `express-rate-limit` has a Redis store adapter, and
    `lib/dedupe.js`'s `isDuplicate`/`remember` interface can be swapped to
    `SETEX`/`EXISTS` without changing the route).
- The server is stateless otherwise (no local filesystem writes, no
  in-process session state), so horizontal scaling is otherwise safe.

## 6. Logging

All lead-processing events are structured, one-line JSON (`[category]
{...}`) on stdout/stderr — see `server/README.md`'s **Logging** section for
the full event/category table. In production, point your platform's log
drain (Vercel log drains, CloudWatch, Datadog, a `docker logs` collector,
etc.) at stdout/stderr; no file-based logging is used, so there's nothing
else to configure. Nothing written to these logs is a secret — the Resend
API key and the Google service-account private key are never logged, and
`lib/logger.js` redacts any accidentally-passed credential-shaped field as a
backstop.

## 7. Pre-launch checklist

- [ ] `CLIENT_ORIGIN` set to the exact production client origin(s) — no
      wildcards, no `localhost`.
- [ ] At least one of Google Sheets or email fully configured (ideally both).
- [ ] Google Sheet shared with the service account email (Editor access);
      the sheet has a tab named exactly `GOOGLE_SHEETS_SHEET_NAME`.
- [ ] Resend credentials verified with a real test send (`npm run dev`
      locally with production `RESEND_API_KEY`/`EMAIL_FROM` in a scratch
      `.env`, submit a test lead).
- [ ] `TURNSTILE_SECRET_KEY` set server-side and `VITE_TURNSTILE_SITE_KEY`
      set at client build time (both, or neither — a mismatch means every
      submission gets rejected with `403`). See `server/README.md`'s
      **Bot protection** section.
- [ ] `TRUST_PROXY` set correctly for your topology (see section 4; automatic
      on Render).
- [ ] (Optional) `SENTRY_DSN` **and** `NODE_ENV=production` both set if you
      want backend error monitoring — neither alone sends events. See
      **Error monitoring (Sentry)** in `server/README.md`.
- [ ] `.env` (or platform secret store) populated; `.env` itself is not
      committed and is not baked into any container image layer.
- [ ] `npm run lint`, `npm run build`, and `npm run test:smoke` all pass in CI
      before deploying.
- [ ] Reverse proxy in front of the app terminates TLS and forwards
      `X-Forwarded-For` correctly if `TRUST_PROXY` is enabled.
- [ ] Logs are shipped somewhere durable (platform log drain, CloudWatch,
      etc.) — `lib/securityLog.js` emits structured `[security] {...}` lines
      worth alerting on (repeated `rate_limited`/`honeypot`/`turnstile_failed`/`validation_failed`
      events from one IP); `lib/logger.js` emits `[submission]`/`[sheets]`/
      `[email]` lines worth alerting on for repeated `*_failed` events.
