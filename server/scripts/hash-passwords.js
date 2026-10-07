// OPTIONAL hardening. Replaces plain-text passwords in the Admins collection with bcrypt
// hashes. Passwords stay exactly the same for the people logging in - nothing new is created.
//
//   npm run hash-passwords             -> dry run (shows what would change, changes nothing)
//   npm run hash-passwords -- --apply  -> actually hashes them
//
// Take a backup/export of the Admins collection from Compass first.
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { assertConfig, config } from "../config.js";
import { connectDb, adminsCollection } from "../db.js";
import { passwordField } from "../utils/admins.js";

assertConfig();
await connectDb();

const apply = process.argv.includes("--apply");
let changed = 0;
let skipped = 0;

for await (const doc of adminsCollection().find({})) {
  const stored = passwordField(doc);
  if (!stored) {
    console.log(`- ${doc._id}: no password field found, skipped`);
    skipped++;
    continue;
  }
  const value = String(stored.value);
  if (/^\$2[aby]\$\d{2}\$/.test(value)) {
    skipped++;
    continue;
  }
  console.log(`- ${doc._id}: plain-text password -> ${apply ? "hashing" : "WOULD hash"}`);
  if (apply) {
    const hash = await bcrypt.hash(value, 12);
    await adminsCollection().updateOne({ _id: doc._id }, { $set: { [stored.field]: hash } });
  }
  changed++;
}

console.log(`\n${apply ? "Hashed" : "Would hash"} ${changed} password(s); ${skipped} already hashed/skipped.`);
if (!apply && changed) console.log("Run again with:  npm run hash-passwords -- --apply");
await mongoose.disconnect();
