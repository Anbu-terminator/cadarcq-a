import jwt from "jsonwebtoken";

import { config } from "../config.js";
import { describeAdmin, findAdminByDocId, passwordFingerprint } from "../utils/admins.js";

export function signSession(doc) {
  const admin = describeAdmin(doc);
  return jwt.sign({ pwf: passwordFingerprint(doc) }, config.jwtSecret, {
    algorithm: "HS256",
    subject: admin.id,
    expiresIn: `${config.sessionHours}h`,
  });
}

export function setSessionCookie(req, res, token) {
  res.cookie(config.cookieName, token, {
    httpOnly: true, // JavaScript can never read the token
    sameSite: "strict", // never sent on cross-site requests
    secure: req.secure, // HTTPS on Render, plain HTTP allowed on localhost
    maxAge: config.sessionHours * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(req, res) {
  res.clearCookie(config.cookieName, { httpOnly: true, sameSite: "strict", secure: req.secure, path: "/" });
}

/** Requires a valid session AND re-checks the admin still exists in MongoDB. */
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[config.cookieName];
    if (!token) return res.status(401).json({ message: "Please log in." });

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    } catch {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    const doc = await findAdminByDocId(payload.sub);
    if (!doc || passwordFingerprint(doc) !== payload.pwf) {
      return res.status(401).json({ message: "Session is no longer valid. Please log in again." });
    }
    req.admin = describeAdmin(doc);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireOwner(req, res, next) {
  if (req.admin?.role !== "owner") {
    return res.status(403).json({ message: "Only the owner can do this." });
  }
  next();
}
