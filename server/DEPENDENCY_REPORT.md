# Dependency Upgrade Report — server

Date: 2026-07-21
Scope: `server/` (Express API). Client package was not touched.

## Summary

Express and its directly-related runtime dependencies were upgraded to the
latest stable versions within their **current major version** (Express stays
on 4.x, per requirement). `npm audit` is now clean — 0 vulnerabilities
(previously 4: 2 high, 2 moderate).

## Versions changed

| Package             | Before   | After    | Type  | Notes |
|----------------------|---------|----------|-------|-------|
| `express`            | 4.21.2  | 4.22.2   | patch | Pulls in fixed `body-parser` (1.20.6) and `path-to-regexp` (0.1.13) transitively. Still Express 4 — Express 5 was **not** introduced. |
| `express-rate-limit`  | 7.4.1   | 8.6.0    | major | Peer dep is `express >= 4.11` (unaffected by staying on Express 4). Verified: `windowMs`, `max`, `standardHeaders`, `legacyHeaders`, `message`, and custom `handler` — all options used in `src/middleware/rateLimit.js` — are unchanged in v8 (`max` is a supported deprecated alias for `limit`). Confirmed working end-to-end via the smoke suite's rate-limit scenario (5 allowed, 6th → 429). |
| `helmet`              | 8.0.0   | 8.3.0    | minor | Same major, called with no options (`helmet()`), no API surface affected. |
| `cors`                | 2.8.5   | 2.8.6    | patch | |
| `dotenv`              | 16.4.7  | 17.4.2   | major | Only functional change vs 16.x is the default for `quiet` flipping to `false` (adds an informational `injecting env (N) from .env` log line at startup). No API/behavior change to env parsing. `import "dotenv/config"` side-effect import (used in `src/instrument.js`) is unaffected. |
| `zod`                 | 3.23.8  | 3.25.76  | patch/minor | Held on the 3.x line intentionally — Zod 4 is a breaking rewrite (error customization API, `.email()`/string format changes, etc.) and was out of scope for a non-breaking upgrade. |

### Unchanged (already at latest, or intentionally held)

| Package | Version | Reason |
|---|---|---|
| `@sentry/node` | 10.67.0 | Already latest. |
| `google-auth-library` | 10.9.0 | Already latest. |
| `nodemailer` | 9.0.3 | Already latest. |
| `libphonenumber-js` | ^1.13.9 | Already latest, caret range already tracks patches. |
| `eslint`, `@eslint/js` | 9.39.5 | Latest major (10.x) requires Node `^20.19 \|\| ^22.13 \|\| >=24`; this project declares `engines.node >= 18`. Upgrading would drop declared Node 18 support, so held on 9.x. Not part of the Express dependency chain. |
| `globals` | 16.5.0 | Dev dependency of the eslint config; held alongside eslint 9.x for the same Node-version reason. |

## Audit fix detail

`npm audit` originally reported (all traced back to Express's transitive deps):

- **high** — `path-to-regexp <0.1.13`: ReDoS via multiple route parameters (GHSA-37ch-88jc-xwx2)
- **moderate** — `body-parser <=1.20.5`: DoS when an invalid `limit` value silently disables size enforcement (GHSA-v422-hmwv-36x6)
- **moderate** (×2) — `qs <=6.15.1`: array/bracket-notation DoS via memory exhaustion, and a `qs.stringify` crash (GHSA-w7fw-mjwx-w883, GHSA-6rw7-vpxm-498p)

Fix path: bumping `express` to `4.22.2` (still Express 4) resolves the `body-parser`/`qs` advisories via its own dependency ranges. `path-to-regexp` needed one extra `npm audit fix` pass (no `--force`, no package.json range changes) to move the resolved transitive version from `0.1.12` to the fixed `0.1.13` within the same `~0.1.12` range Express already declares.

`npm audit fix --force` was **not** used — it would have installed Express 5, which is explicitly excluded by this task.

## Verification performed

```
$ npm audit
found 0 vulnerabilities

$ npm run lint
> eslint .
(clean, no errors)

$ npm run build
> node --check src/index.js && node --check src/app.js && ...
(clean, no errors)

$ npm run test:smoke
SMOKE: 27 passed, 0 failed
```

The smoke suite exercises the full request path (validation, honeypot,
duplicate detection, malformed JSON, oversized payload, rate limiting,
Turnstile verification, and security-event logging), so the
`express-rate-limit` major bump and the `express` patch bump are both
covered by a real HTTP round trip, not just `npm ls`.

## Remaining `npm outdated` entries (intentionally not upgraded)

```
Package     Current   Wanted  Latest
@eslint/js   9.39.5   9.39.5  10.0.1   # needs Node >=20.19, project supports Node >=18
eslint       9.39.5   9.39.5  10.7.0   # same as above
globals      16.5.0   16.5.0  17.7.0   # paired with eslint 9.x
express      4.22.2   4.22.2   5.2.1   # explicitly excluded by task
zod         3.25.76  3.25.76   4.4.3   # major breaking rewrite, excluded from a non-breaking upgrade
```

If a future task wants to move off Node 18 and onto ESLint 10 / Zod 4, those
should be handled as their own dedicated upgrades (config migration for
ESLint's changed rules, and a schema/error-map audit for Zod), not bundled
into a routine dependency bump.
