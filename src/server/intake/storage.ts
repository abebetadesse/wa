/**
 * Intake media storage (photos, voice notes, videos). Files are kept outside the web root under
 * UPLOAD_DIR (default ./storage/uploads) with random names and served only through an
 * access-checked route. Content is sniffed from its first bytes, never trusted from the browser.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { ApiError } from "@/lib/api/route";

export const ATTACHMENT_KINDS = ["image", "audio", "video"] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const MAX_BYTES: Record<AttachmentKind, number> = { image: 10 * 1024 * 1024, audio: 25 * 1024 * 1024, video: 100 * 1024 * 1024 };

/** Known containers by magic bytes → [kind, canonical mime, extension]. */
export function sniff(head: Uint8Array): { kind: AttachmentKind; mime: string; ext: string } | null {
  const at = (offset: number, bytes: number[]) => bytes.every((b, i) => head[offset + i] === b);
  const ascii = (offset: number, text: string) => at(offset, [...text].map((c) => c.charCodeAt(0)));
  if (at(0, [0xff, 0xd8, 0xff])) return { kind: "image", mime: "image/jpeg", ext: "jpg" };
  if (at(0, [0x89, 0x50, 0x4e, 0x47])) return { kind: "image", mime: "image/png", ext: "png" };
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return { kind: "image", mime: "image/webp", ext: "webp" };
  if (ascii(0, "RIFF") && ascii(8, "WAVE")) return { kind: "audio", mime: "audio/wav", ext: "wav" };
  if (ascii(0, "OggS")) return { kind: "audio", mime: "audio/ogg", ext: "ogg" };
  if (ascii(0, "ID3") || at(0, [0xff, 0xfb]) || at(0, [0xff, 0xf3])) return { kind: "audio", mime: "audio/mpeg", ext: "mp3" };
  if (ascii(4, "ftyp")) {
    const brand = String.fromCharCode(...head.slice(8, 12));
    if (/^heic|^heix|^mif1/.test(brand)) return { kind: "image", mime: "image/heic", ext: "heic" };
    if (/^M4A |^M4B /.test(brand)) return { kind: "audio", mime: "audio/mp4", ext: "m4a" };
    if (/^qt/.test(brand)) return { kind: "video", mime: "video/quicktime", ext: "mov" };
    return { kind: "video", mime: "video/mp4", ext: "mp4" };
  }
  // WebM / Matroska (EBML). Browsers record voice notes as audio/webm; the declared kind decides.
  if (at(0, [0x1a, 0x45, 0xdf, 0xa3])) return { kind: "video", mime: "video/webm", ext: "webm" };
  return null;
}

const baseDir = () => path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads"));

export async function storeFile(file: File, declaredKind: AttachmentKind) {
  const size = file.size;
  if (size <= 0) throw ApiError.badRequest("The file is empty.");
  if (size > MAX_BYTES[declaredKind]) throw ApiError.badRequest(`That ${declaredKind} is too large (limit ${Math.round(MAX_BYTES[declaredKind] / 1024 / 1024)} MB).`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniff(bytes.subarray(0, 32));
  if (!detected) throw ApiError.badRequest("This file type is not supported. Use a photo (JPEG, PNG, WebP, HEIC), a voice note (WebM, Ogg, MP3, M4A, WAV) or a video (MP4, MOV, WebM).");
  // WebM carries audio or video; everything else must match what the client said it was.
  const kind: AttachmentKind = detected.mime === "video/webm" && declaredKind === "audio" ? "audio" : detected.kind;
  if (kind !== declaredKind) throw ApiError.badRequest(`That file is not a ${declaredKind}.`);
  const mime = detected.mime === "video/webm" && kind === "audio" ? "audio/webm" : detected.mime;

  const now = new Date();
  const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${detected.ext}`;
  const target = path.join(baseDir(), key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes, { flag: "wx" });
  return { key, kind, mime, size, sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
}

/** Resolves a stored key to its path, refusing anything that would escape the upload folder. */
export function pathFor(key: string) {
  const target = path.resolve(baseDir(), key);
  if (!target.startsWith(baseDir() + path.sep)) throw ApiError.notFound("File");
  return target;
}

export async function removeFile(key: string) {
  await fs.rm(pathFor(key), { force: true });
}
