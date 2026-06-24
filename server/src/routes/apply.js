import { Router } from "express";
import { createApplyRateLimiter } from "../middleware/rateLimit.js";
import { validateApplication } from "../middleware/validate.js";
import { isDuplicate, remember } from "../lib/dedupe.js";
import { forwardLead } from "../lib/forwarder.js";
import { logSuspicious, emailDomain } from "../lib/securityLog.js";

// Builds the /api router with its own rate-limiter instance.
export function createApplyRouter() {
  const router = Router();

  // POST /api/apply
  // Order: rate limit -> validate/sanitize/honeypot -> dedupe -> forward.
  router.post("/apply", createApplyRateLimiter(), validateApplication, async (req, res) => {
    try {
      // Honeypot triggered: pretend success, forward nothing. Bots get no signal.
      if (req.isHoneypot) {
        logSuspicious(req, "honeypot", { emailDomain: emailDomain(req.application?.email) });
        return res.status(200).json({ ok: true });
      }

      const application = req.application;

      // Duplicate submission protection: same lead within the TTL window is
      // acknowledged as success but NOT forwarded again (idempotent UX).
      if (isDuplicate(application)) {
        logSuspicious(req, "duplicate", { emailDomain: emailDomain(application.email) });
        return res.status(200).json({ ok: true, duplicate: true });
      }

      await forwardLead(application, {
        ip: req.ip,
        userAgent: req.get("user-agent"),
        submittedAt: req.body?.submittedAt,
      });

      // Only remember AFTER a successful forward, so a failed delivery can be retried.
      remember(application);

      return res.status(200).json({ ok: true });
    } catch (err) {
      // Downstream/provider failure -> generic 502, details logged server-side.
      console.error("[apply] forward failed:", err?.message || err);
      return res.status(502).json({ error: "Unable to submit right now. Please try again." });
    }
  });

  return router;
}

export default createApplyRouter;
