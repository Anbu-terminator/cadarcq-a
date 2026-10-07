import mongoose from "mongoose";

export const SECTIONS = ["work", "funding", "competition"];
export const FUNDING_STATUSES = ["Applied", "Under Review", "Shortlisted", "Approved", "Rejected"];

const fileSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    kind: { type: String, enum: ["image", "pdf"], required: true },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    section: { type: String, enum: SECTIONS, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, default: "", maxlength: 5000 },
    status: { type: String, enum: [...FUNDING_STATUSES, null], default: null },
    file: { type: fileSchema, default: null },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export const serializePost = (p) => ({
  id: String(p._id),
  section: p.section,
  title: p.title,
  content: p.content || "",
  status: p.status || null,
  file: p.file ? { ...p.file, id: String(p.file.id) } : null,
  createdBy: p.createdBy,
  createdAt: p.createdAt,
});
