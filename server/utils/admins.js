import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import mongoose from "mongoose";

import { adminsCollection } from "../db.js";

// Your Admins documents store: Id, password and display name. Compass users often type
// slightly different field names, so we accept the common spellings (first match wins).
export const ID_FIELDS = ["Id", "id", "ID", "adminId", "adminID", "userId", "username", "loginId"];
export const PASSWORD_FIELDS = ["password", "Password", "pass"];
export const NAME_FIELDS = ["displayName", "display name", "Display Name", "displayname", "DisplayName", "display_name", "name"];

const firstDefined = (doc, fields) => {
  for (const f of fields) if (doc[f] !== undefined && doc[f] !== null && doc[f] !== "") return { field: f, value: doc[f] };
  return null;
};

export const passwordField = (doc) => firstDefined(doc, PASSWORD_FIELDS);

export function describeAdmin(doc) {
  const name = firstDefined(doc, NAME_FIELDS);
  const displayName = name ? String(name.value).trim() : "Admin";
  return {
    id: String(doc._id),
    displayName,
    // Only the account whose display name is "owner" gets add/delete rights.
    role: displayName.toLowerCase() === "owner" ? "owner" : "admin",
  };
}

/** Find an admin by the Id they typed. Matches text, and numeric Ids stored as numbers. */
export async function findAdminByLoginId(loginId) {
  const variants = [loginId];
  if (/^-?\d+(\.\d+)?$/.test(loginId)) variants.push(Number(loginId));
  const or = [];
  for (const field of ID_FIELDS) for (const value of variants) or.push({ [field]: value });
  return adminsCollection().findOne({ $or: or });
}

export async function findAdminByDocId(docId) {
  const or = [{ _id: String(docId) }];
  if (mongoose.isValidObjectId(docId)) or.push({ _id: new mongoose.Types.ObjectId(String(docId)) });
  return adminsCollection().findOne({ $or: or });
}

// A real bcrypt hash used so "unknown Id" takes as long as "wrong password".
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);

const sha = (value) => crypto.createHash("sha256").update(value).digest();

export async function verifyPassword(doc, candidate) {
  const stored = doc ? passwordField(doc) : null;
  if (!stored) {
    await bcrypt.compare(candidate, DUMMY_HASH);
    return false;
  }
  const storedValue = String(stored.value);
  // Supports bcrypt-hashed passwords (recommended) AND plain text exactly as stored today.
  if (/^\$2[aby]\$\d{2}\$/.test(storedValue)) return bcrypt.compare(candidate, storedValue);
  return crypto.timingSafeEqual(sha(candidate), sha(storedValue));
}

/** Fingerprint of the stored password: changing the password in the DB invalidates old sessions. */
export function passwordFingerprint(doc) {
  const stored = passwordField(doc);
  return stored ? crypto.createHash("sha256").update(String(stored.value)).digest("hex").slice(0, 16) : "";
}
