// TEMPORARY DEBUG ENDPOINT
// REMOVE BEFORE PRODUCTION
//
// Added to pin down a `transporter.verify()` failure on Render
// (`ETIMEDOUT` / `command: CONN`) that plain error messages weren't
// surfacing. Reuses the real transporter from lib/email.js (see the exported
// getTransporter()) so this reports on the exact same connection normal
// sending uses — not a separate one that could behave differently.
//
// Gated behind DEBUG_SMTP_TOKEN so the public Render URL can't be scanned
// for it: without that env var set (or on a header mismatch) the route 404s,
// same as if it didn't exist, instead of leaking internal hostname/IP/stack
// traces to anyone who finds the path.
import { Router } from "express";
import { getTransporter } from "../lib/email.js";

export function createDebugSmtpRouter() {
  const router = Router();

  router.get("/debug/smtp", async (req, res) => {
    const token = process.env.DEBUG_SMTP_TOKEN;
    if (!token || req.get("x-debug-token") !== token) {
      return res.status(404).end();
    }

    try {
      const transporter = await getTransporter();
      if (!transporter) {
        const result = {
          success: false,
          message: "Email is not configured (SMTP_* env vars missing).",
        };
        console.log("[debug/smtp]", result);
        return res.status(200).json(result);
      }

      await transporter.verify();

      const result = { success: true, message: "SMTP connection verified successfully." };
      console.log("[debug/smtp]", result);
      return res.status(200).json(result);
    } catch (err) {
      const result = {
        success: false,
        code: err?.code ?? null,
        command: err?.command ?? null,
        errno: err?.errno ?? null,
        syscall: err?.syscall ?? null,
        hostname: err?.hostname ?? null,
        address: err?.address ?? null,
        port: err?.port ?? null,
        response: err?.response ?? null,
        responseCode: err?.responseCode ?? null,
        message: err?.message ?? String(err),
        stack: err?.stack ?? null,
      };
      console.error("[debug/smtp]", result);
      return res.status(500).json(result);
    }
  });

  return router;
}

export default createDebugSmtpRouter;
