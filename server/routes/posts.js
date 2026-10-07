import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { z } from "zod";

import { config } from "../config.js";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import { FUNDING_STATUSES, Post, SECTIONS, serializePost } from "../models/Post.js";
import { cleanFilename, deleteFile, detectFileType, saveFile } from "../utils/files.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1, fields: 10 },
});

const createSchema = z.object({
  section: z.enum(SECTIONS),
  title: z.string().trim().min(1, "Title is required.").max(150, "Title is too long."),
  content: z.string().trim().max(5000, "Content is too long.").default(""),
  status: z.enum(FUNDING_STATUSES).optional(),
});

// Every admin (and the owner) can READ.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const section = z.enum(SECTIONS).safeParse(req.query.section);
    if (!section.success) return res.status(400).json({ message: "Unknown section." });
    const posts = await Post.find({ section: section.data }).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ posts: posts.map(serializePost) });
  } catch (error) {
    next(error);
  }
});

// Only the OWNER can ADD.
router.post("/", requireAuth, requireOwner, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? `File is too large. Maximum size is ${config.maxUploadMb} MB.` : "Upload failed.";
      return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message });
    }
    if (err) return next(err);
    handleCreate(req, res, next);
  });
});

async function handleCreate(req, res, next) {
  let savedFileId = null;
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid data." });
    const { section, title, content, status } = parsed.data;

    let file = null;
    if (req.file) {
      const type = detectFileType(req.file.buffer);
      if (!type) return res.status(400).json({ message: "Only PNG, JPG, WEBP, GIF images or PDF files are allowed." });
      const name = cleanFilename(req.file.originalname, type.ext);
      savedFileId = await saveFile(req.file.buffer, name, { mimeType: type.mime, uploadedBy: req.admin.displayName });
      file = { id: savedFileId, name, mimeType: type.mime, size: req.file.size, kind: type.kind };
    }

    const post = await Post.create({
      section,
      title,
      content,
      status: section === "funding" ? status || "Applied" : null,
      file,
      createdBy: req.admin.displayName,
    });
    res.status(201).json({ post: serializePost(post.toObject()) });
  } catch (error) {
    if (savedFileId) await deleteFile(savedFileId); // don't leave orphan files behind
    next(error);
  }
}

// Only the OWNER can DELETE.
router.delete("/:id", requireAuth, requireOwner, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid id." });
    const post = await Post.findByIdAndDelete(req.params.id).lean();
    if (!post) return res.status(404).json({ message: "Entry not found." });
    if (post.file?.id) await deleteFile(post.file.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
