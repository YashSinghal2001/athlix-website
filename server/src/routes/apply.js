import { Router } from "express";
import * as Sentry from "@sentry/node";
import { createApplyRateLimiter } from "../middleware/rateLimit.js";
import { validateApplication } from "../middleware/validate.js";
import { isDuplicate, remember } from "../lib/dedupe.js";
import { appendLeadToSheet, isGoogleSheetsConfigured } from "../lib/googleSheets.js";
import { sendLeadEmails, isEmailConfigured } from "../lib/email.js";
import { isTurnstileConfigured, verifyTurnstileToken } from "../lib/turnstile.js";
import { logSuspicious, emailDomain } from "../lib/securityLog.js";
import { log } from "../lib/logger.js";

// Builds the /api router with its own rate-limiter instance.
export function createApplyRouter() {
  const router = Router();

  // POST /api/apply
  // Order: rate limit -> validate/sanitize/honeypot -> Turnstile -> dedupe -> deliver.
  router.post("/apply", createApplyRateLimiter(), validateApplication, async (req, res) => {
    try {
      // Honeypot triggered: pretend success, deliver nothing. Bots get no signal.
      // Checked first (free) so a confirmed bot never costs a Turnstile API call.
      if (req.isHoneypot) {
        logSuspicious(req, "honeypot", { emailDomain: emailDomain(req.application?.email) });
        return res.status(200).json({ ok: true });
      }

      const application = req.application;

      // Cloudflare Turnstile: verify the client's proof-of-not-a-bot token.
      // Skipped (not a failure) if TURNSTILE_SECRET_KEY isn't set — see
      // lib/turnstile.js. A real failure here is a clear rejection (unlike
      // the honeypot's silent 200), since a legitimate user's token can also
      // fail (expired/reused) and deserves a message that lets them retry.
      if (isTurnstileConfigured()) {
        const result = await verifyTurnstileToken(req.body?.turnstileToken, req.ip);
        if (!result.success) {
          logSuspicious(req, "turnstile_failed", {
            emailDomain: emailDomain(application.email),
            errorCodes: result.errorCodes,
          });
          return res.status(403).json({ error: "Verification failed. Please refresh and try again." });
        }
      }

      // Duplicate submission protection: same lead within the TTL window is
      // acknowledged as success but NOT delivered again (idempotent UX).
      if (isDuplicate(application)) {
        logSuspicious(req, "duplicate", { emailDomain: emailDomain(application.email) });
        return res.status(200).json({ ok: true, duplicate: true });
      }

      log("submission", "info", "submission_received", {
        email: application.email,
        pathway: application.pathway,
        ip: req.ip,
      });

      const meta = {
        ip: req.ip,
        userAgent: req.get("user-agent"),
        submittedAt: req.body?.submittedAt,
      };

      // Deliver to Google Sheets and email independently — one failing must
      // never lose the lead as long as the other (configured) channel
      // succeeds (see README). A channel that isn't configured at all is
      // skipped rather than counted as a failure, so local dev with no
      // integrations set up still succeeds (accepted + logged).
      const sheetsConfigured = isGoogleSheetsConfigured();
      const emailConfigured = isEmailConfigured();

      let sheetsOk = false;
      let emailOk = false;
      // Captured only for the "every configured channel failed" aggregate
      // error below — the specific per-channel error is already logged (and
      // sent to Sentry) at the point it happens, but without this the final
      // 502's own log line ("submission_failed") only ever said "All
      // configured lead delivery channels failed", forcing a manual
      // cross-reference against earlier lines to find out *why*.
      let sheetsError = null;
      let emailError = null;
      const deliveries = [];

      if (sheetsConfigured) {
        deliveries.push(
          appendLeadToSheet(application)
            .then(() => {
              sheetsOk = true;
              log("sheets", "info", "sheets_saved", { email: application.email });
            })
            .catch((err) => {
              sheetsError = err;
              log("sheets", "error", "sheets_failed", {
                email: application.email,
                error: err?.message || String(err),
              });
              Sentry.captureException(err);
            })
        );
      }

      if (emailConfigured) {
        deliveries.push(
          sendLeadEmails(application, meta).then((result) => {
            emailOk = result.sent;
            if (result.notificationError) {
              log("email", "error", "email_notification_failed", {
                email: application.email,
                error: result.notificationError.message || String(result.notificationError),
              });
              Sentry.captureException(result.notificationError);
            } else {
              log("email", "info", "email_notification_sent", { email: application.email });
            }
            if (result.confirmationError) {
              log("email", "error", "email_confirmation_failed", {
                email: application.email,
                error: result.confirmationError.message || String(result.confirmationError),
              });
              Sentry.captureException(result.confirmationError);
            } else {
              log("email", "info", "email_confirmation_sent", { email: application.email });
            }
            // Both fail together in the common-cause case (Resend API/auth
            // down entirely), so either error is representative; prefer the
            // notification error since it fails first in Promise.allSettled.
            if (!result.sent) {
              emailError = result.notificationError || result.confirmationError;
            }
          })
        );
      }

      await Promise.all(deliveries);

      if (!sheetsConfigured && !emailConfigured) {
        // No destination configured (e.g. local dev). Accept + log, don't leak PII verbosely.
        log("submission", "info", "submission_accepted", {
          email: application.email,
          pathway: application.pathway,
          destination: "none (local dev)",
        });
      } else if (!sheetsOk && !emailOk) {
        // Every configured channel failed — this is the one case where the
        // lead would otherwise be lost, so fail loudly and let the client
        // retry. Named per-channel reasons here (rather than a bare generic
        // message) so the "submission_failed" log line alone is enough to
        // tell Google Sheets, email, and Turnstile failures apart — Turnstile
        // never reaches this point (it 403s earlier), so its absence here is
        // itself informative: this is always a Sheets and/or email failure.
        const reasons = [];
        if (sheetsConfigured) reasons.push(`sheets: ${sheetsError?.message || "unknown error"}`);
        if (emailConfigured) reasons.push(`email: ${emailError?.message || "unknown error"}`);
        throw new Error(`All configured lead delivery channels failed (${reasons.join("; ")})`);
      } else {
        log("submission", "info", "submission_accepted", {
          email: application.email,
          pathway: application.pathway,
          sheetsOk,
          emailOk,
        });
      }

      // Only remember AFTER a successful (or dev-mode) delivery, so a total failure can be retried.
      remember(application);

      return res.status(200).json({ ok: true });
    } catch (err) {
      // Downstream/provider failure -> generic 502, details logged server-side.
      log("submission", "error", "submission_failed", {
        email: req.application?.email,
        error: err?.message || String(err),
      });
      Sentry.captureException(err);
      return res.status(502).json({ error: "Unable to submit right now. Please try again." });
    }
  });

  return router;
}

export default createApplyRouter;
