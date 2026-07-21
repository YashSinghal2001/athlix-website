# Athlix — Production Readiness Audit

**Date:** 2026-07-21
**Scope:** Full repository — `client/` (React/Vite) and `server/` (Express API).
**Method:** Static review of every source, config, and doc file in the repo;
`npm audit` on both packages; a real `npm run build`/`lint`/`test:smoke` run;
manual verification of specific claims (CSP hash match, asset sizes, dead-code
usage, placeholder values) rather than assumption. **No code was modified as
part of this audit** — findings only.

**Not covered** (would need a live/rendered environment): actual color
contrast ratios, a Lighthouse/axe accessibility run, real network waterfall
timing, and live Google Sheets/SMTP/Turnstile calls (credentials aren't
configured in this environment). Where noted below, treat those items as
"recommend automated verification," not confirmed pass/fail.

## Launch Readiness Score: 78 / 100

Zero Critical issues. The security posture is genuinely layered and
deliberate (rate limiting → validation/sanitization → honeypot → Turnstile →
duplicate detection, each documented and fail-safe), error handling never
leaks internals, and there are no secrets in source. The deductions are for
concrete, fixable gaps: a broken contact link shipped to production, an
oversized unoptimized logo asset, no JS code-splitting, an unaddressed
dependency-vulnerability backlog, a missing social-share image, and no CI
enforcing the checks the docs already assume exist. None of these require an
architecture change — most are fixable in well under a day combined.

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 5 |
| Medium | 6 |
| Low | 10 |

---

## Critical

None found. No hardcoded secrets, no injection vectors identified (inputs
are sanitized + schema-validated server-side; outputs are HTML-escaped in
emails), no authentication/authorization bypass (the API has no auth system
to bypass — it's a public lead-capture endpoint by design), no exposed
`.env` files, no RCE/path-traversal surface.

---

## High

### H1. Two WhatsApp contact links use a placeholder number, not the real one
`client/src/App.jsx:1358` (footer, rendered on every page load) and
`client/src/components/ErrorBoundary.jsx:46` (the crash-fallback "reach us on
WhatsApp" link) both link to `https://wa.me/910000000000` — an obviously fake
placeholder (all zeros). The real number, `+91 90301 53337`
(`919030153337`), is only used correctly in the hero's "Book Consultation"
CTA (`App.jsx:428`) and in the backend email templates
(`server/src/lib/email.js`). Anyone clicking the footer WhatsApp link today —
or a user who hits the rare render-error fallback and tries to get help —
reaches a dead/nonexistent chat.
**Fix:** replace both `910000000000` occurrences with `919030153337`.

### H2. Logo asset is 1.36 MB, unoptimized, and dominates the page weight
`client/src/assets/logo-mark.png` is a 3281×1875px, 1.36 MB PNG, displayed at
small on-screen sizes (nav mark + a "method-logo" thumbnail). It is larger
than the entire minified JS bundle combined, and unlike every other image in
this repo it was never converted to WebP/AVIF. It ships as-is to
`dist/assets/logo-mark-*.png` in every production build.
**Fix:** resize to the actual max display dimensions and re-export as WebP
(or SVG, if it's a vector mark) — likely a >95% size reduction.

### H3. No JavaScript code-splitting; single 804 kB bundle
`vite build` itself warns: `dist/assets/index-*.js 803.94 kB │ gzip: 216.87
kB`, "Some chunks are larger than 500 kB after minification." The entire
site (hero, testimonials carousel, FAQ accordion, application form, footer)
is one 1557-line `App.jsx` with no `React.lazy`/dynamic imports, so
`framer-motion`, `swiper`, `lenis`, and `react-phone-number-input` all load
and parse before first paint regardless of what's actually above the fold.
**Fix:** lazy-load below-the-fold sections (testimonials, FAQ, the
transformation carousel) and the phone-input library (only needed once the
user reaches the form).

### H4. Four unaddressed dependency vulnerabilities in the server (`npm audit`)
```
body-parser  <=1.20.5  — moderate — DoS via invalid limit value
path-to-regexp <0.1.13 — high     — ReDoS via multiple route params
qs           <=6.15.1  — moderate — multiple DoS vectors
```
All are transitive dependencies of `express@4.21.2`. A fix is available via
a semver-compatible patch bump to `express@4.22.2` — no breaking change,
`npm audit fix --force` (or a manual version bump) resolves all four.
Real-world exploitability of the `path-to-regexp` ReDoS is lower than the
CVSS score implies here specifically, since this app only has two static
routes (`/health`, `/api/apply`) with no dynamic `:param` segments — but the
`qs`/`body-parser` DoS vectors are reachable via crafted request bodies
regardless of route shape, so this should not be left unpatched.

### H5. Referenced Open Graph / structured-data image doesn't exist
`client/index.html` references `https://athlix.co/og-cover.jpg` in both
`og:image` and the JSON-LD `image` field — but no `og-cover.jpg` (or any
matching file) exists in `client/public/`. Every social share of this site
(Instagram, WhatsApp, LinkedIn, Facebook, X link previews) will render with
a missing/broken preview image, and Google's structured-data validator will
flag the JSON-LD `image` as unresolvable. For a coaching business run
substantially through social sharing, this is high-impact and highly
visible the moment the link is ever shared.
**Fix:** add the actual `og-cover.jpg` (recommended 1200×630) to
`client/public/`.

---

## Medium

### M1. No process-level crash handlers
`server/src/index.js` has no `process.on("uncaughtException", ...)` or
`process.on("unhandledRejection", ...)`. Every current async path is wrapped
in try/catch or `Promise.allSettled`, so real-world risk today is low — but
any error that escapes all of that (a future bug, a synchronous throw in
middleware, an error in `app.listen`'s own callback) crashes the process via
Node's default unstructured stderr dump, with no graceful shutdown and no
structured log line via the app's own `lib/logger.js`/`lib/securityLog.js`.

### M2. No CI/CD pipeline exists
`DEPLOYMENT.md` explicitly instructs "run `npm run lint`, `npm run build`,
and `npm run test:smoke` in CI before deploying," but there is no
`.github/workflows/` or any other CI config anywhere in the repo. These
checks currently only run if a human remembers to run them locally before
pushing — nothing enforces it on PRs or pushes.

### M3. Missing `robots.txt` and `sitemap.xml`
Neither exists in `client/public/`. Not launch-blocking (Google crawls
allow-all by default without a `robots.txt`), but both are standard,
expected SEO artifacts for a marketing site, and a sitemap materially helps
indexing speed/coverage for a JS-rendered SPA.

### M4. Three unaddressed `npm audit` findings on the client (build-time only)
```
@babel/core     — low  — arbitrary file read via sourceMappingURL (dev-only)
brace-expansion — high — DoS via exponential expansion
js-yaml         — high — quadratic-complexity DoS
```
All are transitive dependencies of build/lint tooling (not runtime browser
code) — they do not ship to end users, so the practical exposure is limited
to the dev/CI machine, not site visitors. Still worth fixing: `npm audit
fix` (no `--force` needed) resolves all three with no breaking changes.

### M5. Worst-case request latency stacks sequentially
`routes/apply.js` awaits Turnstile verification (up to an 8s timeout) fully
*before* starting the Google Sheets + email delivery step (which then runs
in parallel, itself up to ~8–10s). In a genuine worst case (Cloudflare slow
to respond, then one delivery channel also slow), a single submission could
take upwards of ~15–18s to resolve, with only the existing "Submitting…"
spinner as feedback — no client-side timeout or progressive feedback.

### M6. In-memory rate-limit and duplicate-detection stores are single-process
Both `middleware/rateLimit.js` (via `express-rate-limit`'s default store)
and `lib/dedupe.js` are already self-documented as per-process/in-memory.
This is fine for the current single-Railway-instance deployment, but it's
worth flagging at the audit level since it's a real constraint the moment
this scales horizontally: each instance gets its own counters, so the
effective rate limit becomes `5 × instance count`, and duplicate detection
only catches repeats landing on the same instance.

---

## Low

### L1. Dead/unused fields threaded through the delivery pipeline
`routes/apply.js` computes `meta.userAgent` and `meta.submittedAt` on every
request and passes them into `appendLeadToSheet()`/`sendLeadEmails()`, but
neither function reads anything but `meta.ip` (confirmed via grep — no other
`meta.*` reference exists in `lib/googleSheets.js` or `lib/email.js`). The
JSDoc on both functions still lists `userAgent, submittedAt` as consumed
params, which is now inaccurate. Harmless, but worth pruning.

### L2. One error path bypasses the structured logger
`middleware/errorHandler.js`'s generic 500 fallback uses a raw
`console.error("[error]", err?.stack || err)` instead of `lib/logger.js`.
Every other error/event path in the app emits `[tag] {json}` lines; this one
doesn't, so log-drain tooling tuned for that format will miss it (the
message itself is still captured as plain text on stderr, just not
machine-parseable the same way).

### L3. Stale template boilerplate in both root-level and client READMEs
The root `README.md` and `client/README.md` still contain unmodified
starter-template content (e.g. "You should see: Black background with
yellow 'ATHLIX READY' text," generic Tailwind v4 tutorial sections, the
default Vite/React template blurb) that no longer describes the actual
product. Misleading for anyone onboarding from these files.

### L4. Orphaned script
`client/verify-sweep.mjs` exists but isn't referenced by any `package.json`
script, CI config, or doc in the repo. Unclear if it's still needed or a
leftover from a one-off manual check.

### L5. Unused ESLint disable directive
`client/src/components/ErrorBoundary.jsx:23` — `// eslint-disable-next-line
no-console` — flagged by ESLint itself as a no-op, since this project's lint
config doesn't have a `no-console` rule enabled. Has been surfacing as a
lint warning throughout this project's history.

### L6. ~255 MB of unused raw source images committed to the repo
`client/src/assets/` contains dozens of `*_before.png`/`*_after.png` files
up to 12 MB each (255 MB total for the directory). Confirmed via grep that
`App.jsx` only imports the optimized `.webp` companions — none of these raw
PNGs are bundled, so **production bundle size is unaffected**. They do,
however, substantially inflate every `git clone`/CI checkout of this
monorepo (including Railway's initial clone step, even though its build
root is scoped to `server/`).

### L7. Root `.DS_Store` is tracked in git
Despite `.gitignore` covering `.DS_Store` in both `client/` and `server/`,
the repo root's own `.DS_Store` is already committed (added before the
ignore rule existed — gitignore doesn't retroactively untrack). Cosmetic,
zero functional impact.

### L8. CORS `methods: ["POST"]` blocks cross-origin browser `GET /health`
Fine for `curl`/server-side uptime monitors (not subject to CORS), but would
silently block a browser-JS-based status-page widget hosted on a different
origin from calling `/health` directly.

### L9. CSP inline-script hash is currently correct, but fragile
Verified: the SHA-256 hash of `index.html`'s inline theme-detection script
currently matches the `script-src` hash declared in all three CSP configs
(`client/deploy/security-headers.conf`, `client/public/_headers`,
`client/vercel.json`). There's no automated check enforcing this, though —
any future edit to that inline script without recomputing/updating the hash
in all three files would silently stop it from executing under an enforced
CSP (fails safe, not a security hole — just an easy-to-miss regression).

### L10. `lib/dedupe.js`'s cleanup is a full O(n) scan gated by a size check
`isDuplicate()` sweeps the whole in-memory map once its size exceeds 5000,
and re-checks that size threshold on every single call while over it. Given
the 5/IP/hour rate limit this is very unlikely to matter in practice, but
it's a real trigger for a full-map scan on every request during any period
where the map is not draining faster than it grows.

---

## What's already solid

- **Layered, documented bot/abuse defense**: rate limiting → schema
  validation/sanitization → honeypot → Cloudflare Turnstile → duplicate
  detection, each independently fail-safe and each explicitly ordered to
  avoid wasting cost on requests already known to be bots.
- **No secrets in source** — verified via repo-wide grep; every credential
  is `process.env`-sourced with a documented, commented `.env.example`.
- **Privacy-conscious, two-tier structured logging** — abuse/security
  events log only an email *domain*; lead-delivery events log the full
  email (needed for support) but never phone/name/message; a
  defense-in-depth redaction backstop in `lib/logger.js` strips anything
  credential-shaped even if a call site passes it by mistake.
- **Careful Google Sheets bootstrap** — self-creates the tab/headers/status
  dropdown, and specifically protects pre-existing production data: header
  migration only ever backfills trailing columns on a verified prefix
  match, never overwrites unrecognized content.
- **Consistent, strong CSP** across all three hosting targets (Nginx,
  Netlify-style `_headers`, Vercel), correctly extended for Turnstile.
- **Solid accessibility foundations** — every `<img>` has an alt attribute
  (including deliberate empty `alt=""` on decorative ones); icon-only
  buttons have `aria-label`; the mobile menu uses `role="dialog"`/
  `aria-modal`; the honeypot field is `aria-hidden` and removed from tab
  order (avoiding a common honeypot accessibility mistake); a single `<h1>`
  per page.
- **Clean error handling** — no stack traces, internal messages, or
  provider errors ever reach the client; verified by the smoke suite.
- **Thorough, accurate deployment docs** — spot-checked against the actual
  code in this audit and found consistent.
- **No `.env` files committed**; `.gitignore` correctly scoped in both
  packages.

## Suggested fix order

1. H1 (broken WhatsApp links) — trivial, two-line fix, real user impact.
2. H5 (missing OG image) — add one image file.
3. H4 + M4 (`npm audit fix`) — low-risk dependency bumps.
4. H2 + H3 (logo size, code-splitting) — biggest real performance win.
5. M1 (crash handlers), M2 (CI) — cheap, meaningfully raises operational
   confidence before/soon after launch.
6. Everything else (Low tier) — cleanup, no urgency.
