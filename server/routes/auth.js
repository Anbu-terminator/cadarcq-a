import { Router } from "express";
import { z } from "zod";

import { clearSessionCookie, requireAuth, setSessionCookie, signSession } from "../middleware/auth.js";
import { loginLimiter, lockout } from "../middleware/security.js";
import { describeAdmin, findAdminByLoginId, verifyPassword } from "../utils/admins.js";

const router = Router();

const loginSchema = z.object({
  id: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

const INVALID = { message: "Invalid ID or password." };

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    // zod guarantees plain strings, which blocks NoSQL-injection payloads like {"$ne": ""}
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Enter your ID and password." });
    const { id, password } = parsed.data;

    const key = id.toLowerCase();
    if (lockout.isLocked(key)) {
      return res.status(429).json({ message: "This account is temporarily locked. Try again in 15 minutes." });
    }

    const doc = await findAdminByLoginId(id);
    const ok = await verifyPassword(doc, password); // runs even when Id unknown (timing)
    if (!doc || !ok) {
      lockout.fail(key);
      return res.status(401).json(INVALID);
    }

    lockout.clear(key);
    setSessionCookie(req, res, signSession(doc));
    res.json({ user: describeAdmin(doc) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.admin });
});

export default router;
