import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import { config } from "./config.js";
import { apiLimiter, csrfGuard } from "./middleware/security.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import fileRoutes from "./routes/files.js";
import postRoutes from "./routes/posts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // Render sits behind one proxy: needed for HTTPS detection + real client IPs

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "20kb" }));

  // ---------- API ----------
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 });
  });

  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", apiLimiter, csrfGuard);
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api", (req, res) => res.status(404).json({ message: "Not found." }));

  // ---------- Website (built React app) ----------
  if (fs.existsSync(path.join(distDir, "index.html"))) {
    app.use(
      express.static(distDir, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
      }),
    );
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.set("Cache-Control", "no-cache");
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    app.get("/", (req, res) =>
      res
        .status(200)
        .send("API is running. Frontend not built yet - run `npm run dev` (development) or `npm run build` (production)."),
    );
  }

  // ---------- Errors ----------
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error("[error]", error);
    if (error?.type === "entity.too.large") return res.status(413).json({ message: "Request too large." });
    if (error?.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid request." });
    res.status(500).json({ message: "Server error. Please try again." });
  });

  return app;
}
