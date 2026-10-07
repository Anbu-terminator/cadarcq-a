import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.js";
import { chatPostLimiter } from "../middleware/security.js";
import { ChatMessage, serializeMessage } from "../models/ChatMessage.js";

const router = Router();

const messageSchema = z.object({ text: z.string().trim().min(1).max(1000) });

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const latest = await ChatMessage.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ messages: latest.reverse().map(serializeMessage) });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, chatPostLimiter, async (req, res, next) => {
  try {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Message must be 1-1000 characters." });
    const message = await ChatMessage.create({
      text: parsed.data.text,
      senderId: req.admin.id,
      senderName: req.admin.displayName,
      role: req.admin.role,
    });
    res.status(201).json({ message: serializeMessage(message.toObject()) });
  } catch (error) {
    next(error);
  }
});

export default router;
