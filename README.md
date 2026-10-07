# Cadarcq Technologies — Website + Secure Admin Portal

React (Vite + TanStack Router + Tailwind) frontend · Node/Express backend · MongoDB.
One server serves the public website **and** the API, so it deploys as a single Render service.

## What the admin portal does
| Page | Who sees it | Who can add / delete |
|------|-------------|----------------------|
| Next work assigned | every logged-in admin + owner | **owner only** |
| Funding applied & status | every logged-in admin + owner | **owner only** |
| Competition updates | every logged-in admin + owner | **owner only** |
| Team chat | every logged-in admin + owner | everyone can send |

* Login URL: `/admin/login` (small "Admin" link in the site footer).
* Accounts are read from MongoDB database **Cadarcq**, collection **Admins** (fields: Id, password, display name). Nothing new is created there.
* Display name **owner** → owner rights. Any other display name (e.g. *admin*) → view + chat only.
* Each entry = **title + poster image or PDF (optional) + text content (optional)**; funding entries also have a status.

## Security built in
* httpOnly + SameSite=Strict + Secure(HTTPS) session cookie (token never readable by JavaScript), 8h expiry
* Login rate-limit (10 failures / 15 min / IP) + per-ID lockout (5 failures → 15 min)
* Same error for wrong ID or wrong password, constant-time comparison, NoSQL-injection-proof input validation
* Supports bcrypt-hashed passwords **and** the plain-text ones you already stored (optional upgrade script below)
* Owner-only add/delete enforced **on the server**, not just hidden in the UI
* Admin is re-checked in MongoDB on every request → deleting an admin or changing a password logs them out
* Uploads: type checked by file signature, 10 MB cap, stored in MongoDB GridFS, visible only to logged-in admins
* Helmet security headers + CSP, CSRF header/origin guard, gzip

---
## 1. Run locally
Requirements: **Node.js 22.12+** (or 20.19+) and your MongoDB URI.

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
```
Edit `.env`:
```
MONGODB_URI=<your own MongoDB URI>
MONGODB_DB=Cadarcq
ADMINS_COLLECTION=Admins
JWT_SECRET=<run:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
```
Put your logo at `src/assets/logo.png` (the Lovable logo file was not inside the zip; until you add it the favicon is shown).

```bash
npm run dev
```
Open **http://localhost:5173** (website) → footer **Admin** → or go to http://localhost:5173/admin/login

Production-style local test: `npm run build && npm start` → http://localhost:5000

## 2. Deploy on Render
**Important – database must be reachable from the internet.** Render cannot reach a MongoDB running on your own PC.
Use MongoDB Atlas (free):
1. Atlas → create a free cluster → *Database Access*: create a DB user (user + password).
2. Atlas → *Network Access* → **Add IP Address → Allow access from anywhere (0.0.0.0/0)** (Render free has no fixed IP).
3. If your admins are currently in a local Compass database: in Compass open `Cadarcq.Admins` → **Export Collection** (JSON), connect to Atlas, create database `Cadarcq` with collection `Admins`, and **Import** that file.
4. Atlas → *Connect → Drivers* → copy the URI, replace `<password>` (URL-encode special characters, `@` → `%40`).

Then:
1. Push this folder to a new GitHub repository (`.env` is git-ignored — never upload it).
2. Render → **New → Blueprint** → pick the repo (uses `render.yaml`).
   *(or New → Web Service: Build `npm install --include=dev && npm run build`, Start `npm start`)*
3. When asked, set **MONGODB_URI** to your Atlas URI. `JWT_SECRET` is generated automatically.
4. Deploy. Open `https://<your-service>.onrender.com/admin/login`.

Free Render services sleep after ~15 min idle (first request takes ~30 s). Uploaded files live in MongoDB so they are never lost on redeploy.

## 3. Optional: hash the existing plain-text passwords
Same passwords, just stored safely. Export `Admins` from Compass first as a backup.
```bash
npm run hash-passwords              # dry run – shows what would change
npm run hash-passwords -- --apply   # does it
```

## Troubleshooting
| Problem | Fix |
|---------|-----|
| `JWT_SECRET is missing…` | add a 32+ character value to `.env` / Render env vars |
| `Could not connect to MongoDB` | wrong URI/password, or Atlas Network Access doesn't allow 0.0.0.0/0 |
| "Invalid ID or password" with correct details | open an Admins document in Compass: field names must be like `Id` / `password` / `displayName` (variants like `display name` also work). Value types must match what you type |
| Logged in but can't add | display name must be exactly `owner` (case-insensitive) |
| Too many attempts message | wait 15 min (or restart the server locally) |
| Blank page after deploy | check Render build log for `vite build` errors |
