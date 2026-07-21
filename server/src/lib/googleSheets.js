// Appends each lead as a row in a Google Sheet via a service account.
// Also bootstraps the target tab and its header row on first use, so a
// brand-new spreadsheet works with zero manual setup beyond sharing it.
//
// SECRETS LIVE HERE, SERVER-SIDE ONLY. The browser never sees the service
// account key — it only ever talks to our own /api/apply route.
//
// Setup: create a Google Cloud service account, enable the Sheets API, share
// the target spreadsheet with the service account's client email (Editor),
// then set GOOGLE_SHEETS_* in .env. If unset, appendLeadToSheet() throws so
// the caller can fall back to the other delivery channel (see routes/apply.js).

import { JWT } from "google-auth-library";
import { parsePhoneNumber } from "libphonenumber-js";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TIMEOUT_MS = 8000;
const API_ROOT = "https://sheets.googleapis.com/v4/spreadsheets";

// Column order is fixed and must match this exactly — appendLeadToSheet()
// writes values in this same order. New columns must be appended at the
// END of this list, never inserted in the middle: ensureHeaderRow() can
// backfill missing trailing headers on an older sheet, but that self-healing
// only works because every past version of this list is a strict prefix of
// the current one — insert a column in the middle instead and old data rows
// would end up misaligned under the wrong header.
//
// This is the second schema version. The first version's column A was
// "Timestamp" (date + time) and also carried UTM/Referrer/Landing Page/IP
// columns and a single combined "Phone" column — see ensureHeaderRow() for
// how a sheet still on that older schema gets its header row migrated.
export const SHEET_HEADERS = [
  "Date",
  "Full Name",
  "Country",
  "Country Code",
  "Mobile Number",
  "Email",
  "Gender",
  "Current Weight (kg)",
  "Preferred Coaching Pathway",
  "Challenges",
  "Source",
  "Status",
];

// Column A's label under the retired first schema version. Its presence is
// what identifies a sheet as still needing migration (see ensureHeaderRow).
const LEGACY_SCHEMA_MARKER = "Timestamp";

// Wide enough to read every column the retired schema ever used (17, A-Q),
// regardless of the current (narrower) SHEET_HEADERS width, so a legacy
// sheet's trailing UTM/Referrer/Landing Page/IP headers are actually seen
// and can be cleared during migration rather than silently left dangling.
const HEADER_SCAN_LAST_COLUMN = "Z";

/** 0-based column index -> A1 letter(s): 0 -> A, 25 -> Z, 26 -> AA, ... */
function columnLetter(index) {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

const LAST_COLUMN = columnLetter(SHEET_HEADERS.length - 1);
const STATUS_COLUMN_INDEX = SHEET_HEADERS.indexOf("Status"); // 0-based; L = 11

// The closed set of lead-status values. Enforced in the sheet itself via a
// dropdown (data validation) on the Status column, so a human editing the
// sheet can't drift into a typo'd or unexpected status.
export const STATUS_OPTIONS = ["New", "Called", "Converted", "Rejected", "Follow Up"];

let cachedClient = null;
// Tabs we've already confirmed have a header row, keyed by
// "<spreadsheetId>::<sheetName>". Avoids a metadata round-trip on every
// single submission once a tab is known-good for this process's lifetime.
const readyTabs = new Set();

function getClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;

  if (!cachedClient) {
    cachedClient = new JWT({ email: clientEmail, key: privateKey, scopes: SCOPES });
  }
  return cachedClient;
}

/** True once GOOGLE_SHEETS_* env vars are present (used for local-dev messaging only). */
export function isGoogleSheetsConfigured() {
  return Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && getClient());
}

// A sheet/tab title containing spaces or special characters must be
// single-quoted in an A1 range (e.g. 'New Leads'!A1:K1); a literal quote in
// the title is escaped by doubling it. Plain alphanumeric titles don't need
// quoting, but quoting them too is harmless, so we always quote.
function quotedSheetName(sheetName) {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

/** IST wall-clock date only, formatted DD/MM/YYYY (Asia/Kolkata), no time. */
function formatIstDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// Resolves ISO 3166-1 alpha-2 codes ("IN") to display names ("India").
// Built into Node/V8 — no country-name dependency needed.
const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

/**
 * Split a phone number into { country, countryCode, mobileNumber } using
 * libphonenumber-js's structured parse — the same library that already
 * validates the number in middleware/validate.js — rather than a hand-rolled
 * regex. `phone` is expected to already be a valid E.164 string by the time
 * it reaches here (validateApplication guarantees this).
 */
function splitPhone(phone) {
  const parsed = parsePhoneNumber(phone);
  if (!parsed) return { country: "", countryCode: "", mobileNumber: phone || "" };
  return {
    country: parsed.country ? countryDisplayNames.of(parsed.country) : "",
    countryCode: parsed.countryCallingCode ? `+${parsed.countryCallingCode}` : "",
    mobileNumber: parsed.nationalNumber || "",
  };
}

async function sheetsRequest(path, { method = "GET", token, body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_ROOT}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Google Sheets API ${method} ${path} failed: ${res.status} ${text.slice(0, 300)}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Returns { sheetId, title } for the named tab, or null if it doesn't exist. */
async function getTabProperties(spreadsheetId, sheetName, token) {
  const meta = await sheetsRequest(
    `/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties(sheetId,title)`,
    { token }
  );
  const match = (meta?.sheets || []).find((s) => s.properties?.title === sheetName);
  return match ? match.properties : null;
}

/** Creates the tab and returns its new numeric sheetId. */
async function createTab(spreadsheetId, sheetName, token) {
  try {
    const result = await sheetsRequest(`/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
      method: "POST",
      token,
      body: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
    });
    return result.replies[0].addSheet.properties.sheetId;
  } catch (err) {
    // Another concurrent request may have created it first — that's fine,
    // as long as the tab exists now. Anything else is a real failure.
    const alreadyExists = err.status === 400 && /already exists/i.test(err.body || "");
    if (!alreadyExists) throw err;
    const props = await getTabProperties(spreadsheetId, sheetName, token);
    if (!props) throw err; // genuinely missing despite the "already exists" error — surface the original failure
    return props.sheetId;
  }
}

/**
 * Restrict the Status column to STATUS_OPTIONS via a dropdown (data
 * validation), covering row 2 down to the end of the sheet so it also
 * applies to rows appended later. Re-applying this is a plain overwrite of
 * the same rule on the same range, so calling it more than once is safe —
 * it can't create duplicate rules or duplicate rows.
 */
async function applyStatusDropdown(spreadsheetId, sheetId, token) {
  await sheetsRequest(`/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
    method: "POST",
    token,
    body: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1, // row 2 (row 1 is the header)
              startColumnIndex: STATUS_COLUMN_INDEX,
              endColumnIndex: STATUS_COLUMN_INDEX + 1,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: STATUS_OPTIONS.map((value) => ({ userEnteredValue: value })),
              },
              showCustomUi: true,
              strict: true,
            },
          },
        },
      ],
    },
  });
}

async function getHeaderRow(spreadsheetId, sheetName, token) {
  // Scans past the current schema's width (HEADER_SCAN_LAST_COLUMN, not
  // LAST_COLUMN) so a legacy sheet's trailing columns are visible too — the
  // Sheets API only returns cells up to the last non-empty one in the row,
  // so this is exactly as accurate for an up-to-date sheet as scanning the
  // narrower range would be.
  const range = `${quotedSheetName(sheetName)}!A1:${HEADER_SCAN_LAST_COLUMN}1`;
  const result = await sheetsRequest(
    `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
    { token }
  );
  return (result?.values?.[0] || []).map(String);
}

async function writeHeaderRange(spreadsheetId, sheetName, startColumnIndex, headers, token) {
  const startCol = columnLetter(startColumnIndex);
  const endCol = columnLetter(startColumnIndex + headers.length - 1);
  const range = `${quotedSheetName(sheetName)}!${startCol}1:${endCol}1`;
  // `update` (not `append`) targets this exact fixed range every time, so
  // calling it more than once — even concurrently — can never duplicate a
  // header row; it only ever overwrites the same cells with the same values.
  await sheetsRequest(
    `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    { method: "PUT", token, body: { values: [headers] } }
  );
}

/**
 * Bring the header row up to date with SHEET_HEADERS, touching only what's
 * actually missing or stale:
 *   - row 1 completely empty        -> write the full header row
 *   - row 1 already matches SHEET_HEADERS (ignoring any extra legacy
 *     columns already cleared by a prior migration) -> leave untouched
 *   - row 1 is a strict prefix of SHEET_HEADERS (an older, shorter version
 *     of this same schema) -> backfill only the missing trailing columns,
 *     never touching the existing ones
 *   - row 1's column A is still "Timestamp" (the retired schema's marker,
 *     see LEGACY_SCHEMA_MARKER) -> migrate: overwrite row 1 with
 *     SHEET_HEADERS, then blank out any now-unused trailing legacy columns
 *     (old UTM/Referrer/Landing Page/IP headers). This ONLY ever touches
 *     row 1 — every data row below is left completely alone, so nothing is
 *     deleted, moved, or overwritten. Rows written before this migration
 *     keep their old shape under the new headers (e.g. the old single
 *     "Phone" value sitting under "Country") — that's an inherent tradeoff
 *     of a column-order change; every row appended AFTER migration uses the
 *     new layout correctly.
 *   - anything else (headers that don't match any recognized shape) -> leave
 *     untouched entirely, same as before
 */
async function ensureHeaderRow(spreadsheetId, sheetName, token) {
  const existing = await getHeaderRow(spreadsheetId, sheetName, token);
  const isBlank = existing.every((cell) => cell.trim() === "");
  if (isBlank) {
    await writeHeaderRange(spreadsheetId, sheetName, 0, SHEET_HEADERS, token);
    return;
  }

  const matchesCurrent = SHEET_HEADERS.every((h, i) => existing[i] === h);
  if (matchesCurrent) return;

  const isShorterPrefix =
    existing.length < SHEET_HEADERS.length &&
    existing.every((cell, i) => cell === SHEET_HEADERS[i]);
  if (isShorterPrefix) {
    const missing = SHEET_HEADERS.slice(existing.length);
    await writeHeaderRange(spreadsheetId, sheetName, existing.length, missing, token);
    return;
  }

  if (existing[0] === LEGACY_SCHEMA_MARKER) {
    // Single write covering the whole row (new headers + blanks over any
    // now-unused trailing legacy columns) so this migration is one atomic
    // PUT — never two separate requests that could leave a half-migrated
    // row behind if the process died in between.
    const trailingBlanks = new Array(Math.max(0, existing.length - SHEET_HEADERS.length)).fill("");
    await writeHeaderRange(spreadsheetId, sheetName, 0, [...SHEET_HEADERS, ...trailingBlanks], token);
  }
}

/**
 * Ensure the target tab exists, has an up-to-date header row, and has the
 * Status-column dropdown applied — creating/fixing whichever of those is
 * actually missing (see ensureHeaderRow for the exact header rules).
 * Status dropdown is (re)applied every time this isn't yet cached as ready,
 * regardless of the header outcome, so it self-heals even for a tab that
 * already existed before this feature shipped.
 * Memoized per process so steady-state appends skip the extra round-trips.
 */
async function ensureSheetReady(spreadsheetId, sheetName, token) {
  const cacheKey = `${spreadsheetId}::${sheetName}`;
  if (readyTabs.has(cacheKey)) return;

  const existing = await getTabProperties(spreadsheetId, sheetName, token);
  let sheetId;

  if (!existing) {
    sheetId = await createTab(spreadsheetId, sheetName, token);
  } else {
    sheetId = existing.sheetId;
  }
  await ensureHeaderRow(spreadsheetId, sheetName, token);

  await applyStatusDropdown(spreadsheetId, sheetId, token);

  readyTabs.add(cacheKey);
}

/**
 * Append one lead as a row, creating the tab + header row first if this is
 * the first write to it. Throws on any failure (missing config, auth,
 * network, non-2xx) so callers can decide how to handle it — this module
 * never swallows errors itself.
 * @param {object} application sanitized + validated fields
 */
export async function appendLeadToSheet(application) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const client = getClient();
  if (!spreadsheetId || !client) {
    throw new Error("Google Sheets is not configured (GOOGLE_SHEETS_* env vars missing).");
  }

  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME;
  if (!sheetName) {
    throw new Error("Google Sheets is not configured (GOOGLE_SHEETS_SHEET_NAME env var missing).");
  }

  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Google Sheets auth failed: no access token.");

  await ensureSheetReady(spreadsheetId, sheetName, token);

  const { country, countryCode, mobileNumber } = splitPhone(application.phone);

  // Order must match SHEET_HEADERS exactly. UTM/Referrer/Landing Page/IP are
  // intentionally not written here — they're no longer part of this schema
  // (still used for email attribution, see lib/email.js).
  const row = [
    formatIstDate(),
    application.name,
    country,
    countryCode,
    mobileNumber,
    application.email,
    application.gender,
    application.currentWeight,
    application.pathway,
    application.message || "",
    "Website",
    STATUS_OPTIONS[0],
  ];

  const range = `${quotedSheetName(sheetName)}!A:${LAST_COLUMN}`;
  await sheetsRequest(
    `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", token, body: { values: [row] } }
  );
}
