import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
chatSchema.index({ createdAt: -1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatSchema);

export const serializeMessage = (m) => ({
  id: String(m._id),
  text: m.text,
  senderId: m.senderId,
  senderName: m.senderName,
  role: m.role,
  createdAt: m.createdAt,
});
