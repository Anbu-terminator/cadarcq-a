import mongoose from "mongoose";

// Uploaded posters / PDFs are stored INSIDE MongoDB (GridFS) so they survive Render
// restarts and redeploys (Render's disk is temporary). No extra storage service needed.
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });

/** Detect the real type from the first bytes - we never trust the browser-supplied type. */
export function detectFileType(buf) {
  if (buf.length < 12) return null;
  const startsWith = (...bytes) => bytes.every((b, i) => buf[i] === b);
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: "image/png", ext: "png", kind: "image" };
  if (startsWith(0xff, 0xd8, 0xff)) return { mime: "image/jpeg", ext: "jpg", kind: "image" };
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return { mime: "image/gif", ext: "gif", kind: "image" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { mime: "image/webp", ext: "webp", kind: "image" };
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return { mime: "application/pdf", ext: "pdf", kind: "pdf" };
  return null;
}

export function saveFile(buffer, filename, metadata) {
  return new Promise((resolve, reject) => {
    const stream = bucket().openUploadStream(filename, { metadata });
    stream.on("error", reject);
    stream.on("finish", () => resolve(stream.id));
    stream.end(buffer);
  });
}

export const openFile = (id) => bucket().openDownloadStream(new mongoose.Types.ObjectId(String(id)));

export async function findFile(id) {
  const files = await bucket().find({ _id: new mongoose.Types.ObjectId(String(id)) }).limit(1).toArray();
  return files[0] || null;
}

export async function deleteFile(id) {
  try {
    await bucket().delete(new mongoose.Types.ObjectId(String(id)));
  } catch (error) {
    // Already gone - nothing to do.
    if (!/FileNotFound/i.test(String(error?.message))) console.error("[files] delete failed:", error.message);
  }
}

/** Safe filename for display / Content-Disposition. */
export const cleanFilename = (name, ext) => {
  const base = String(name || "file")
    .replace(/\.[^.]*$/, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .slice(0, 80);
  return `${base || "file"}.${ext}`;
};
