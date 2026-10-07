import rateLimit from "express-rate-limit";

import { config } from "../config.js";

/** CSRF guard for state-changing requests (cookies are also SameSite=Strict). */
export function csrfGuard(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  if (req.get("x-requested-with") !== "XMLHttpRequest") {
    return res.status(403).json({ message: "Blocked request." });
  }
  const origin = req.get("origin");
  if (origin) {
    let host = "";
    try {
      host = new URL(origin).host;
    } catch {
      return res.status(403).json({ message: "Blocked request." });
    }
    if (host !== req.get("host") && origin !== config.clientOrigin) {
      return res.status(403).json({ message: "Blocked request." });
    }
  }
  next();
}

const tooMany = (message) => ({ message });

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany("Too many failed login attempts. Please try again in 15 minutes."),
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany("Too many requests. Please slow down."),
});

export const chatPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany("You are sending messages too quickly."),
});

// Per-Id lockout (in memory): 5 wrong passwords -> locked for 15 minutes.
const failures = new Map();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export const lockout = {
  isLocked(key) {
    const entry = failures.get(key);
    if (!entry) return false;
    if (entry.lockedUntil && entry.lockedUntil > Date.now()) return true;
    if (entry.lockedUntil) failures.delete(key);
    return false;
  },
  fail(key) {
    const entry = failures.get(key) || { count: 0, lockedUntil: 0 };
    entry.count += 1;
    if (entry.count >= MAX_FAILS) {
      entry.lockedUntil = Date.now() + LOCK_MS;
      entry.count = 0;
    }
    failures.set(key, entry);
    if (failures.size > 5000) failures.delete(failures.keys().next().value);
  },
  clear(key) {
    failures.delete(key);
  },
};
