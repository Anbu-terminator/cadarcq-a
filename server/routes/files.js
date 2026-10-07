import { Router } from "express";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/auth.js";
import { findFile, openFile } from "../utils/files.js";

const router = Router();

// Files are only visible to logged-in admins (no public links).
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid id." });
    const file = await findFile(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found." });

    const mime = file.metadata?.mimeType || "application/octet-stream";
    const disposition = req.query.download === "1" ? "attachment" : "inline";
    const safeName = encodeURIComponent(file.filename);
    res.set({
      "Content-Type": mime,
      "Content-Length": String(file.length),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${safeName}`,
      "Cache-Control": "private, max-age=300",
    });
    const stream = openFile(file._id);
    stream.on("error", next);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;
