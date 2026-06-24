# Athlix Backend API

Secure submission API for the "Apply For Coaching" form. The React/Vite client
posts to `POST /api/apply`; this server validates, sanitizes, rate-limits,
de-dupes, and forwards the lead to your CRM/email/webhook using **server-side
secrets only**. The browser never sees any key.

## Run

```bash
cd server
cp .env.example .env      # fill in LEAD_WEBHOOK_URL / tokens for production
npm install
npm run dev               # http://localhost:8787  (or npm start)
```

With no `LEAD_WEBHOOK_URL` configured, submissions are accepted and logged
(handy for local development).

## Endpoint

`POST /api/apply` — JSON body:

```json
{
  "name": "Jane Doe",
  "phone": "+91 90000 00000",
  "email": "jane@example.com",
  "age": "28",
  "gender": "Female",
  "currentWeight": "72",
  "goal": "Fat Loss",
  "pathway": "Hybrid Coaching",
  "message": "optional",
  "company": ""            // honeypot — must stay empty
}
```

Responses are intentionally **generic**:
- `200 { ok: true }` — accepted (also returned for honeypot hits and duplicates)
- `400 { error: "Invalid submission." }` — failed validation
- `429 { error: "Too many requests. ..." }` — rate limit (5 / IP / hour)
- `502 { error: "Unable to submit right now. ..." }` — downstream delivery failed

## Security controls

| Control | Where |
|---|---|
| Field validation (allow-lists, formats) | `middleware/validate.js` (zod) |
| Input sanitization (strip control chars / `<>`, length caps) | `lib/sanitize.js` |
| Rate limiting (5/IP/hour) | `middleware/rateLimit.js` |
| Honeypot (`company` field) | `middleware/validate.js` + route |
| Duplicate-submission protection (1h fingerprint) | `lib/dedupe.js` |
| Secrets server-side only | `lib/forwarder.js` + `.env` |
| Security headers / CORS / body-size cap | `app.js` (helmet, cors, json limit) |
| Generic errors (no stack/details leaked) | `middleware/errorHandler.js` |

## Production notes

- Set `TRUST_PROXY=1` only when behind a proxy you control (so rate limiting
  uses the real client IP).
- Set `CLIENT_ORIGIN` to your site origin(s) for CORS.
- Duplicate protection is in-memory (per process). For multiple instances,
  back `lib/dedupe.js` with Redis (`SETEX`) — same interface.

## Smoke test

```bash
npm run test:smoke
```
