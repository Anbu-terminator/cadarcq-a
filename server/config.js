import "dotenv/config";

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const config = {
  port: num(process.env.PORT, 5000),
  mongoUri: (process.env.MONGODB_URI || "").trim(),
  dbName: (process.env.MONGODB_DB || "Cadarcq").trim(),
  adminsCollection: (process.env.ADMINS_COLLECTION || "Admins").trim(),
  jwtSecret: process.env.JWT_SECRET || "",
  sessionHours: num(process.env.SESSION_HOURS, 8),
  maxUploadMb: num(process.env.MAX_UPLOAD_MB, 10),
  clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").trim(),
  cookieName: "cadarcq_session",
};

export function assertConfig() {
  const problems = [];
  if (!config.mongoUri) problems.push("MONGODB_URI is missing (paste your MongoDB connection string).");
  if (config.jwtSecret.length < 32) {
    problems.push(
      "JWT_SECRET is missing or shorter than 32 characters. Generate one with:\n" +
        "    node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
    );
  }
  if (problems.length) {
    console.error("\n[config] Cannot start:\n - " + problems.join("\n - ") + "\n");
    process.exit(1);
  }
}
