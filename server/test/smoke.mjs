// Smoke test for the Athlix API. Spins up real app instances on ephemeral
// ports and exercises every security control via HTTP. No external deps.
import { createApp } from "../src/app.js";

process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// no LEAD_WEBHOOK_URL => forwarder logs + succeeds
// High limit for functional scenarios; the rate-limit scenario overrides to 5.
process.env.RATE_LIMIT_MAX = "1000";

// Capture structured security logs emitted via console.warn("[security] {...}").
const securityEvents = [];
const origWarn = console.warn.bind(console);
console.warn = (...args) => {
  const line = args.join(" ");
  if (line.startsWith("[security] ")) {
    try { securityEvents.push(JSON.parse(line.slice("[security] ".length))); } catch { /* ignore */ }
    return; // keep test output clean
  }
  origWarn(...args);
};
const loggedEvent = (name) => securityEvents.some((e) => e.event === name);

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log(`  [PASS] ${name}`); } else { fail++; console.log(`  [FAIL] ${name}`); } };

function listen(app) {
  return new Promise((resolve) => {
    const srv = app.listen(0, () => resolve({ srv, port: srv.address().port }));
  });
}
const validBody = (over = {}) => ({
  name: "Jane Doe", phone: "+919000000000", email: "jane@example.com",
  gender: "Female", currentWeight: "72",
  pathway: "Hybrid Coaching", message: "Hello", company: "", ...over,
});
const post = (port, body) =>
  fetch(`http://localhost:${port}/api/apply`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });

// ── Functional controls (app A) ───────────────────────────────────────────
{
  const { srv, port } = await listen(createApp());

  const health = await fetch(`http://localhost:${port}/health`);
  ok("health 200", health.status === 200);

  const valid = await post(port, validBody({ email: "valid1@example.com" }));
  const vjson = await valid.json();
  ok("valid submission -> 200 ok:true", valid.status === 200 && vjson.ok === true);

  // Per-field validation: each bad field is rejected with a SAFE field message.
  const badEmail = await post(port, validBody({ email: "not-an-email" }));
  const bejson = await badEmail.json();
  ok("invalid email -> 400 with safe fields.email", badEmail.status === 400 && !!bejson.fields?.email && typeof bejson.fields.email === "string");

  const badPhone = await post(port, validBody({ email: "p@example.com", phone: "123" }));
  const bpjson = await badPhone.json();
  ok("invalid phone -> 400 fields.phone", badPhone.status === 400 && !!bpjson.fields?.phone);

  const badWeight = await post(port, validBody({ email: "w@example.com", currentWeight: "abc" }));
  const bwjson = await badWeight.json();
  ok("invalid weight -> 400 fields.currentWeight", badWeight.status === 400 && !!bwjson.fields?.currentWeight);

  const badName = await post(port, validBody({ email: "n@example.com", name: "http://spam.com" }));
  const bnjson = await badName.json();
  ok("invalid name (url) -> 400 fields.name", badName.status === 400 && !!bnjson.fields?.name);

  const badEnum = await post(port, validBody({ email: "v2@example.com", pathway: "Telepathic Coaching" }));
  const genjson = await badEnum.json();
  ok("invalid enum (pathway) -> 400 fields.pathway", badEnum.status === 400 && !!genjson.fields?.pathway);

  // Safety: error responses must not leak internals or echo submitted values.
  const leak = JSON.stringify(bejson) + JSON.stringify(bnjson);
  ok("error messages are safe (no stack/echoed input)", !/stack|at .*:\d+|http:\/\/spam\.com|not-an-email/.test(leak));

  const hp = await post(port, validBody({ email: "bot@example.com", company: "SpamCo" }));
  const hpjson = await hp.json();
  ok("honeypot filled -> 200 ok (silently accepted)", hp.status === 200 && hpjson.ok === true);

  srv.close();
}

// ── Duplicate-submission protection (fresh app, own rate-limit counter) ─────
{
  const { srv, port } = await listen(createApp());
  const dupe = validBody({ email: "dupe@example.com", phone: "+919111111111" });
  const d1 = await post(port, dupe);
  const d2 = await post(port, dupe);
  const d2json = await d2.json();
  ok("first submission ok", d1.status === 200);
  ok("duplicate submission -> 200 duplicate:true", d2.status === 200 && d2json.duplicate === true);
  srv.close();
}

// ── Malformed JSON + oversized payload (fresh app) ──────────────────────────
{
  const { srv, port } = await listen(createApp());
  const badJson = await fetch(`http://localhost:${port}/api/apply`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{ not json ",
  });
  ok("malformed JSON -> 400", badJson.status === 400);

  const huge = await post(port, validBody({ email: "big@example.com", message: "x".repeat(20000) }));
  ok("oversized payload -> 413", huge.status === 413);
  srv.close();
}

// ── Rate limiting (fresh app B: 5/IP/hour) ──────────────────────────────────
{
  process.env.RATE_LIMIT_MAX = "5"; // restore the production default for this scenario
  const { srv, port } = await listen(createApp());
  const statuses = [];
  for (let i = 0; i < 6; i++) {
    const r = await post(port, validBody({ email: `rl${i}@example.com`, phone: `+91922220000${i}` }));
    statuses.push(r.status);
  }
  console.log("    rate-limit statuses:", statuses.join(", "));
  ok("first 5 requests allowed", statuses.slice(0, 5).every((s) => s === 200));
  ok("6th request blocked -> 429", statuses[5] === 429);
  srv.close();
}

// ── Suspicious-request logging (#8) ─────────────────────────────────────────
console.log("  --- suspicious request logging ---");
console.log("    events captured:", JSON.stringify([...new Set(securityEvents.map((e) => e.event))]));
ok("logged validation_failed", loggedEvent("validation_failed"));
ok("logged honeypot", loggedEvent("honeypot"));
ok("logged duplicate", loggedEvent("duplicate"));
ok("logged rate_limited", loggedEvent("rate_limited"));
ok("logged bad_json", loggedEvent("bad_json"));
ok("logged payload_too_large", loggedEvent("payload_too_large"));
ok("security logs include ip + userAgent + path", securityEvents.every((e) => "ip" in e && "userAgent" in e && "path" in e));
ok("security logs contain NO raw PII (no full email/phone/name keys)",
  securityEvents.every((e) => !("email" in e) && !("phone" in e) && !("name" in e) && !("message" in e)));

console.log(`\nSMOKE: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
