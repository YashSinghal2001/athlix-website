# Athlix — Deployment Guide

This is the end-to-end deployment guide for the whole project: the React/Vite
client and the Express API server, deployed **independently** of each other.

- **Client** (`client/`) — static build, deployed to **Hostinger**.
- **Server** (`server/`) — Node/Express API, deployed to **Railway**.

This document does not perform any deployment or modify any code — it's a
reference for the steps a human (or CI) runs. For deeper backend-only detail
(scaling, in-memory limits, security controls) see
[`server/DEPLOYMENT.md`](./server/DEPLOYMENT.md) and
[`server/README.md`](./server/README.md); for client build internals see
[`client/README.md`](./client/README.md).

## Contents

1. [Local setup](#1-local-setup)
2. [Production setup (overview)](#2-production-setup-overview)
3. [Google Sheets setup](#3-google-sheets-setup)
4. [Hostinger SMTP setup](#4-hostinger-smtp-setup)
5. [Cloudflare Turnstile setup](#5-cloudflare-turnstile-setup)
6. [Railway deployment (backend)](#6-railway-deployment-backend)
7. [Hostinger deployment (frontend)](#7-hostinger-deployment-frontend)
8. [Environment variables](#8-environment-variables)
9. [Troubleshooting](#9-troubleshooting)
10. [Error monitoring (Sentry) setup](#10-error-monitoring-sentry-setup)

---

## 1. Local setup

Requires Node.js ≥ 18.

```bash
git clone <your-repo-url> athlix
cd athlix

# Backend
cd server
cp .env.example .env      # defaults work as-is for local dev — see below
npm install
npm run dev                # http://localhost:8787

# Frontend (separate terminal)
cd ../client
npm install
npm run dev                 # http://localhost:5173
```

- The Vite dev server proxies `/api/*` to `http://localhost:8787`
  (`client/vite.config.js`), so the client can call same-origin `/api/apply`
  with no CORS setup and no `VITE_API_URL` needed locally.
- With no `GOOGLE_SHEETS_*` / `SMTP_*` set in `server/.env`, form submissions
  are accepted and simply logged to the server console — no external
  services are required to develop against the form end-to-end.
- With no `TURNSTILE_SECRET_KEY` set in `server/.env` (and no
  `VITE_TURNSTILE_SITE_KEY` in `client/.env`), Turnstile verification is
  skipped entirely — honeypot, validation, and rate limiting still apply.
- Open `http://localhost:5173`, fill out the application form, and confirm a
  `200` in the Network tab and a `[submission] {"event":"submission_accepted",...}`
  line in the server terminal.

## 2. Production setup (overview)

The client and server are deployed to **different hosts** and talk to each
other over HTTPS:

```
Browser  ──▶  Hostinger (client static build)  ──▶  Railway (server API)
```

Two ways to wire client and server together — pick one:

- **Reverse-proxy `/api/*` on Hostinger to Railway (recommended).** The
  client keeps using same-origin `/api/apply`; no `VITE_API_URL` and no CSP
  change needed (the shipped CSP's `connect-src` is `'self'` plus
  `https://challenges.cloudflare.com` for Turnstile — see
  [§7](#7-hostinger-deployment-frontend)).
- **Call Railway directly from the browser.** Set `VITE_API_URL` to the
  Railway app's URL at client build time, and add that same URL to
  `connect-src` in `client/deploy/security-headers.conf`, `client/public/_headers`,
  and `client/vercel.json` (whichever your host uses) — **without editing
  and redeploying these, the browser's Content-Security-Policy will block
  the request** even though CORS is configured correctly server-side.

Either way, on the server side set `CLIENT_ORIGIN` to the exact client
origin(s) (e.g. `https://athlix.in,https://www.athlix.in`) — this is what
the server's CORS check allows.

## 3. Google Sheets setup

Enables the "save lead to a spreadsheet" delivery channel
(`server/src/lib/googleSheets.js`).

1. In the [Google Cloud Console](https://console.cloud.google.com/), create
   (or pick) a project, then **APIs & Services → Library** → enable the
   **Google Sheets API**.
2. **APIs & Services → Credentials → Create Credentials → Service account.**
   Give it any name (e.g. `athlix-leads`); no roles/project-wide permissions
   are needed.
3. Open the new service account → **Keys → Add key → Create new key → JSON**.
   Download the JSON key file. Treat it as a secret — never commit it.
4. Create (or open) the target Google Sheet (any existing spreadsheet
   document works — you don't need to create a tab inside it; see step 6).
5. Click **Share** on the spreadsheet and share it with the service
   account's email (the `client_email` field in the JSON key), with
   **Editor** access. This step is required — without it the API returns a
   permissions error and this channel fails (logged as `sheets_failed`).
6. From the spreadsheet's URL
   (`https://docs.google.com/spreadsheets/d/<ID>/edit`), copy `<ID>`.
7. Fill in the server's env vars from the JSON key + the above:

   | Env var | From the JSON key / sheet |
   |---|---|
   | `GOOGLE_SHEETS_SPREADSHEET_ID` | the `<ID>` from the sheet URL |
   | `GOOGLE_SHEETS_CLIENT_EMAIL` | `client_email` |
   | `GOOGLE_SHEETS_PRIVATE_KEY` | `private_key` — paste as one line, keep the `\n` escapes literal exactly as they appear in the JSON |
   | `GOOGLE_SHEETS_SHEET_NAME` | any tab name you want (e.g. `Leads`) — **no need to create it first** |

8. Verify: submit a test application (locally or in production). The first
   submission automatically creates the `GOOGLE_SHEETS_SHEET_NAME` tab (if
   it doesn't already exist) with the header row `Timestamp, Full Name,
   Phone, Email, Gender, Current Weight, Preferred Coaching Pathway,
   Challenges, Source, IP, Status, UTM Source, UTM Medium, UTM Campaign,
   UTM Content, Referrer, Landing Page`, then appends the lead below it.
   `Timestamp` is in `Asia/Kolkata` (IST). Confirm the row appears and the
   server logs `[sheets] {"event":"sheets_saved",...}`.

All four variables are required together — if any one is missing, this
channel is treated as not configured and is skipped entirely (not logged as
a failure); see **Lead processing** in `server/README.md` (which also has
the full column reference and the exact rules for when headers are
written — they're never duplicated).

## 4. Hostinger SMTP setup

Enables the notification + applicant-confirmation emails
(`server/src/lib/email.js`), sent through a Hostinger-hosted mailbox.

1. In **hPanel → Emails**, create a mailbox if you don't have one already
   (e.g. `info@athlix.in`).
2. Open that mailbox → **Configure Email Client** (or **Connect Devices**)
   to get the SMTP settings. Hostinger's typical values:
   - Host: `smtp.hostinger.com`
   - Port: `465` (SSL/implicit TLS) or `587` (STARTTLS)
   - Username: the full mailbox address
   - Password: the mailbox password (create an app-specific one if your
     plan supports it)
3. Fill in the server's env vars:

   | Env var | Value |
   |---|---|
   | `SMTP_HOST` | `smtp.hostinger.com` |
   | `SMTP_PORT` | `465` or `587` |
   | `SMTP_SECURE` | `true` for port 465, `false` for port 587 |
   | `SMTP_USER` | the mailbox address |
   | `SMTP_PASS` | the mailbox password |
   | `SMTP_FROM` | optional — defaults to `SMTP_USER` |
   | `LEAD_NOTIFICATION_EMAIL` | inbox that should receive new-lead alerts (e.g. `info@athlix.in`) |

4. Verify: submit a test application and confirm both emails arrive (check
   spam on first send), and the server logs `email_notification_sent` /
   `email_confirmation_sent`. If either email fails, the server logs the
   specific failure (`email_notification_failed` /
   `email_confirmation_failed`) without ever logging the SMTP password.

All five SMTP variables are required together to enable this channel;
`LEAD_NOTIFICATION_EMAIL` additionally gates only the notification email —
the applicant confirmation still sends without it.

## 5. Cloudflare Turnstile setup

Enables server-verified bot protection on the application form
(`server/src/lib/turnstile.js`), on top of — not instead of — the existing
honeypot, schema validation, and rate limiting. The widget is invisible
(`size: "invisible"`); it adds no visible UI, so the form's design doesn't
change whether this is configured or not.

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Turnstile**
   → **Add widget**. Enter your domain(s) (e.g. `athlix.in`, and
   `localhost` if you want to test with real keys locally).
2. Choose any widget mode — the app always renders it with
   `size: "invisible"` regardless of what you pick here.
3. Copy the two keys it gives you:

   | Key | Goes in | Notes |
   |---|---|---|
   | Site key | `client/.env` → `VITE_TURNSTILE_SITE_KEY` | Public — safe to expose in the browser bundle. |
   | Secret key | `server/.env` → `TURNSTILE_SECRET_KEY` | Secret — server-side only, never sent to the client. |

4. Rebuild/redeploy the client after setting `VITE_TURNSTILE_SITE_KEY` (it's
   baked in at build time, like all `VITE_` vars) and restart/redeploy the
   server after setting `TURNSTILE_SECRET_KEY`.
5. Verify: submit a test application and confirm the server logs do **not**
   show a `turnstile_failed` security event. To verify the rejection path,
   temporarily break it (e.g. unset the site key on a rebuilt client so no
   token is sent) and confirm the submission returns
   `403 { error: "Verification failed. ..." }`.

If either key is left unset, Turnstile verification is skipped entirely —
not a failure, and not a security regression on its own, since honeypot +
validation + rate limiting are always active regardless. See **Bot
protection** in `server/README.md` for the full layering and ordering.

**CSP note:** the Turnstile script/iframe/network calls require
`challenges.cloudflare.com` in `script-src`, `frame-src`, and `connect-src`.
This repo's shipped CSP (`client/deploy/security-headers.conf`,
`client/public/_headers`, `client/vercel.json`) already allows this — no
further CSP change is needed for Turnstile itself. You only need to touch
the CSP again if you also change how the client reaches the API (see §2).

## 6. Railway deployment (backend)

1. Push this repo to GitHub (Railway deploys from a Git repo).
2. In [Railway](https://railway.app/), **New Project → Deploy from GitHub
   repo** → select this repo.
3. Because this is a monorepo (client + server in one repo), set the
   service's **root directory to `server`**: service **Settings → Source →
   Root Directory** → `server`. Railway then runs `npm install` and
   `npm start` (`node src/index.js`) from within `server/` using Nixpacks —
   no Dockerfile needed.
4. **Variables** tab → add every required/enabled env var from
   `server/.env.example` (§8 below has the full list). Do **not** set
   `PORT` — Railway injects it automatically, and the server already reads
   `process.env.PORT`.
5. Set `CLIENT_ORIGIN` to your Hostinger-hosted client's exact origin(s),
   e.g. `https://athlix.in,https://www.athlix.in`.
6. Deploy. Railway assigns a `*.up.railway.app` domain — under **Settings →
   Networking** you can attach a custom domain (e.g. `api.athlix.in`) with a
   CNAME instead.
7. If you're proxying `/api/*` from the Hostinger side (§2/§7), point that
   proxy at this Railway URL. If you're calling Railway directly from the
   browser, set `VITE_API_URL` to it at client build time (§7) and update
   the CSP `connect-src` in all three of `client/deploy/security-headers.conf`,
   `client/public/_headers`, and `client/vercel.json`.
8. Verify: `curl https://<your-railway-url>/health` should return
   `{"status":"ok","uptime":...,"timestamp":...,"version":...}`.
9. Every push to the connected branch redeploys automatically; Railway
   restarts the process on crash. Run `npm run lint`, `npm run build`
   (`server/`'s syntax-check script), and `npm run test:smoke` in CI before
   merging/deploying — see `server/DEPLOYMENT.md` §6 (pre-launch checklist).

Railway is a single Node process, so the in-memory rate limiter and
duplicate-submission cache work correctly at one instance; if you later
scale to multiple instances, see the Redis note in `server/DEPLOYMENT.md`
§5 (Scaling notes).

## 7. Hostinger deployment (frontend)

Build the static site:

```bash
cd client
npm install
npm run build      # outputs client/dist/
```

Pick the option matching your Hostinger plan:

### Option A — Hostinger VPS with Nginx (matches the config already in this repo)

This repo already ships `client/deploy/nginx.conf` and
`client/deploy/security-headers.conf` for exactly this setup.

1. Provision a Hostinger VPS (Ubuntu), install Nginx, and point DNS
   (A/AAAA records) at it for your domain.
2. Copy the build output to the server, e.g.:
   ```bash
   rsync -avz client/dist/ user@your-vps:/var/www/athlix/dist/
   ```
3. Copy `client/deploy/nginx.conf` and `client/deploy/security-headers.conf`
   to `/etc/nginx/conf.d/` on the VPS. Edit `nginx.conf`'s `server_name` and
   TLS certificate paths for your domain (e.g. via `certbot --nginx`).
4. To keep the API same-origin (recommended, matches the shipped CSP with
   no changes needed), uncomment and edit the `location /api/` block in
   `nginx.conf` to `proxy_pass` to your Railway backend's HTTPS URL instead
   of `127.0.0.1:8787` (that placeholder assumes a backend colocated on the
   same VPS, which isn't the case when using Railway).
5. `nginx -t && systemctl reload nginx`.
6. Re-run steps 2–5 on every deploy (or wire this into CI).

### Option B — Hostinger shared/business hosting (hPanel File Manager)

1. In hPanel, open **File Manager** for your domain and navigate to
   `public_html`.
2. Upload the **contents** of `client/dist/` (not the folder itself) into
   `public_html`.
3. Because this is a single-page app, add SPA fallback routing so deep
   links / refreshes don't 404. Shared hosting is Apache, so create an
   `.htaccess` in `public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
4. Shared hosting can't run the Nginx config in this repo, so the security
   headers from `client/deploy/security-headers.conf` won't apply
   automatically — add equivalent `Header set ...` directives to the same
   `.htaccess` if your plan's Apache build has `mod_headers` enabled, or
   accept a reduced header set on this tier.
5. Since there's no reverse proxy here, either set `VITE_API_URL` to your
   Railway backend URL before running `npm run build` (and update
   `connect-src` in `client/public/_headers`/CSP as described in §2), or use
   Hostinger's own reverse-proxy/subdomain features if your plan supports
   them.

## 8. Environment variables

Full reference with setup instructions and comments lives in
`server/.env.example` (backend) and `client/.env.example` (frontend). Never
commit either `.env` file. Summary:

### Server (`server/.env`)

| Variable | Required? | Purpose |
|---|---|---|
| `PORT` | Yes (Railway sets it automatically) | Port the API listens on. |
| `CLIENT_ORIGIN` | Yes | Comma-separated allowed browser origin(s) for CORS. |
| `TRUST_PROXY` | No | Set when behind a reverse proxy (Railway's edge, or your Hostinger proxy) so rate limiting sees the real client IP. |
| `RATE_LIMIT_MAX` | No | Max submissions per IP per window. Default `5`. |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window in ms. Default `3600000` (1h). |
| `APP_VERSION` | No | Version string reported by `GET /health`. Defaults to `package.json`'s version. |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | For Sheets channel | See §3. |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | For Sheets channel | See §3. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | For Sheets channel | See §3. |
| `GOOGLE_SHEETS_SHEET_NAME` | For Sheets channel | See §3. |
| `SMTP_HOST` | For email channel | See §4. |
| `SMTP_PORT` | For email channel | See §4. |
| `SMTP_SECURE` | For email channel | See §4. |
| `SMTP_USER` | For email channel | See §4. |
| `SMTP_PASS` | For email channel | See §4. |
| `SMTP_FROM` | No | Overrides the `From` header; defaults to `SMTP_USER`. |
| `LEAD_NOTIFICATION_EMAIL` | For notification email | See §4. |
| `TURNSTILE_SECRET_KEY` | No (see §5) | Enables server-side Turnstile verification. |
| `SENTRY_DSN` | No (see §10) | Enables backend error monitoring. Requires `NODE_ENV=production` too — neither alone sends events. |

"For Sheets channel" / "For email channel" vars must all be set together to
enable that channel; if any one is missing, that whole channel is skipped
(not treated as a failure). At least one channel should be fully configured
in production, or leads are only ever logged, never durably captured.

### Client (`client/.env`)

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_API_URL` | No | Base URL of the backend API. Leave empty for same-origin `/api/apply` (recommended — see §2/§7 Option A). Set only if calling Railway directly from the browser (§2/§7 Option B). |
| `VITE_TURNSTILE_SITE_KEY` | No (see §5) | Cloudflare Turnstile site key (public). Leave empty to skip Turnstile client-side. |
| `VITE_SENTRY_DSN` | No (see §10) | Enables frontend error monitoring. Only sends events in a production build (`vite build`); `vite dev` never sends events. |

`VITE_`-prefixed variables are bundled into the public client JS — never put
a secret in one. All secrets belong in `server/.env` only.

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Form submit fails with a CORS error in the browser console | `CLIENT_ORIGIN` on the server doesn't exactly match the client's origin (scheme + host, no trailing slash) | Set `CLIENT_ORIGIN` to the exact production origin(s), comma-separated for multiple. |
| Form submit is blocked before it even leaves the browser (CSP violation in console, no network request) | `VITE_API_URL` points cross-origin but `connect-src` in the CSP wasn't updated to allow it | Either drop `VITE_API_URL` and reverse-proxy `/api/*` same-origin (§7 Option A), or add the API origin to `connect-src` in `client/deploy/security-headers.conf`, `client/public/_headers`, and `client/vercel.json`, then rebuild/redeploy. |
| `502 Unable to submit right now` on every submission | Every configured delivery channel (Sheets and/or email) is failing | Check server logs for `sheets_failed` / `email_notification_failed` / `email_confirmation_failed` — they include the error message (never credentials). |
| Google Sheets: `sheets_failed` with a permissions/403-style error | The spreadsheet wasn't shared with the service account (Editor access) — the server can't create the tab or write to it | Re-check §3 step 5. |
| Google Sheets: auth errors | `GOOGLE_SHEETS_PRIVATE_KEY` was pasted with real newlines instead of literal `\n`, or is missing the `-----BEGIN/END PRIVATE KEY-----` lines | Re-copy the `private_key` field from the JSON key exactly, keeping `\n` as two characters (backslash + n), not an actual line break. |
| Email: `email_notification_failed` / `email_confirmation_failed` with an auth error | Wrong `SMTP_USER`/`SMTP_PASS`, or `SMTP_SECURE` doesn't match `SMTP_PORT` (465 = `true`, 587 = `false`) | Re-verify credentials in hPanel → Emails → Configure Email Client; confirm the port/secure pairing. |
| Emails send but land in spam | New sending domain/mailbox has no reputation yet, or SPF/DKIM/DMARC aren't set up for the domain | Configure SPF/DKIM records for your domain in hPanel → DNS (Hostinger usually provisions these automatically for its own mailboxes — verify they're present). |
| Every submission returns `403 { error: "Verification failed..." }` | `TURNSTILE_SECRET_KEY` is set server-side but the client isn't sending a valid token — e.g. `VITE_TURNSTILE_SITE_KEY` wasn't set at client build time, the domain isn't added to the Turnstile widget in the Cloudflare dashboard, or the CSP is blocking the Turnstile script/iframe | Confirm both keys are set (§5), that the site key's widget lists your exact domain, and check the browser console for a CSP violation naming `challenges.cloudflare.com`. |
| Legitimate users occasionally hit the Turnstile 403 | Token expired (the widget fetches a fresh token per submit, but a very slow network could still time out) or an ad blocker blocked Cloudflare's script | This degrades to "please retry," never a silent failure — a retry re-fetches a fresh token. No frontend design change is needed to fix this; it's expected occasional friction of any bot-check. |
| Legitimate users get `429 Too many requests` unexpectedly | `TRUST_PROXY` isn't set behind a reverse proxy, so every request appears to come from the proxy's IP and shares one rate-limit bucket | Set `TRUST_PROXY=1` (or the correct hop count) only when you control the proxy in front of the server. |
| Client shows a blank page or 404 on refresh at a deep link | Missing SPA fallback routing | Nginx: confirm `try_files $uri $uri/ /index.html;` is in place (already in `client/deploy/nginx.conf`). Shared hosting: add the `.htaccess` rewrite from §7 Option B. |
| Railway deploy fails to detect the app / installs nothing | Root directory not set for the monorepo | Set the Railway service's Root Directory to `server` (Settings → Source). |
| `GET /health` unreachable from Railway's health checks | Health check path/port misconfigured, or the app crashed on boot (check required env vars) | `curl` the Railway-provided URL directly; check deploy logs for a startup error (e.g. a required var format issue) — the server logs the error message, never a secret value. |
| Duplicate lead accepted twice within an hour | Dedupe fingerprint (`email` + `phone`) didn't match — e.g. phone formatted differently between submissions | Confirms by design if the fingerprint truly differs; check `server/src/lib/dedupe.js` for the exact fingerprint logic (in-memory, per-process — resets on redeploy/restart). |
| Sentry configured but no events show up | `NODE_ENV` isn't exactly `production` on the server, or the client wasn't rebuilt after setting `VITE_SENTRY_DSN` (it's baked in at build time like all `VITE_` vars), or a browser ad blocker is silently dropping requests to `*.sentry.io` | Confirm `NODE_ENV=production` **and** `SENTRY_DSN` are both set server-side (§10); rebuild/redeploy the client after setting `VITE_SENTRY_DSN`; test in a browser without an ad/tracker blocker to rule that out. |

## 10. Error monitoring (Sentry) setup

Enables error monitoring for both the client (React crashes, unhandled
promise rejections, `window.onerror`) and the server (uncaught Express
errors, Google Sheets/email delivery failures) — see **Error monitoring
(Sentry)** in `server/README.md` for exactly what's captured server-side.
This is purely additive: every existing console/structured log line (both
client and server) keeps working exactly as before.

1. In [Sentry](https://sentry.io/), create (or pick) an organization, then
   create **two** projects — one Node project (backend) and one React
   project (frontend). Each gives you a separate DSN under **Settings →
   Client Keys (DSN)**.
2. Set the backend DSN as `SENTRY_DSN` in the server's environment
   (Railway → Variables), **and** set `NODE_ENV=production` alongside it —
   Railway does not set `NODE_ENV` automatically, and events are only sent
   when both are present (see `server/.env.example`).
3. Set the frontend DSN as `VITE_SENTRY_DSN` in `client/.env` (or your
   host's build-time env vars) before running `npm run build` — like all
   `VITE_` vars, it's baked in at build time and only takes effect in a
   production build (`vite dev` never sends events).
4. **CSP**: this repo's shipped CSP (`client/deploy/security-headers.conf`,
   `client/public/_headers`, `client/vercel.json`) already allows
   `https://*.sentry.io` in `connect-src` — no further CSP change is needed
   for Sentry itself, same pattern as Turnstile in §5.
5. Redeploy both the server (with `SENTRY_DSN` + `NODE_ENV=production`) and
   the client (rebuilt with `VITE_SENTRY_DSN`).
6. Verify:
   - Backend: temporarily misconfigure a delivery channel (or check the
     Sentry Node project after a real `sheets_failed`/`email_*_failed`
     event) and confirm it appears in Sentry within a minute or so.
   - Frontend: temporarily throw inside a component during a local
     production build (`npm run build && npm run preview`) with
     `VITE_SENTRY_DSN` set, trigger it in the browser, and confirm the
     event appears in the Sentry React project (and that the friendly
     `ErrorBoundary` fallback UI still shows — Sentry reporting never
     changes what the user sees, see `client/src/components/ErrorBoundary.jsx`).

Leave `SENTRY_DSN` / `VITE_SENTRY_DSN` unset to disable error monitoring
entirely — everything else in this app works identically either way, same
"frictionless local dev, opt-in in production" pattern as Google
Sheets/email/Turnstile.
