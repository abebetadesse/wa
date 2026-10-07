import fs from "node:fs/promises";
import { and, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { workflowCaseMedia } from "@/lib/db/schema";
import type { AuthenticatedUser } from "@/lib/auth";
import { ApiError } from "@/lib/api/route";
import { pathFor, removeFile, storeFile } from "@/server/intake/storage";
import { deleteReturning, insertReturning } from "@/lib/db/write";

const ABANDONED_AFTER_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
let lastCleanupAt = 0;

async function removeAbandonedMedia() {
  const stale = await deleteReturning(
    db,
    workflowCaseMedia,
    and(isNull(workflowCaseMedia.caseId), lt(workflowCaseMedia.createdAt, new Date(Date.now() - ABANDONED_AFTER_MS))),
    { storageKey: workflowCaseMedia.storageKey },
  );
  for (const item of stale) {
    await removeFile(item.storageKey).catch((error) => console.error("[case-workflow] failed to remove abandoned media:", error));
  }
}

export async function uploadWorkflowMedia(user: AuthenticatedUser, kind: "audio" | "video", file: File) {
  if (Date.now() - lastCleanupAt >= CLEANUP_INTERVAL_MS) {
    lastCleanupAt = Date.now();
    void removeAbandonedMedia().catch((error) => console.error("[case-workflow] abandoned media cleanup failed:", error));
  }
  const stored = await storeFile(file, kind);
  try {
    const [media] = await insertReturning(db, workflowCaseMedia, {
      userId: user.id,
      kind: stored.kind,
      mimeType: stored.mime,
      sizeBytes: stored.size,
      storageKey: stored.key,
      originalName: file.name?.slice(0, 200) || null,
      sha256: stored.sha256,
    }, { fields: { id: workflowCaseMedia.id } });
    return { id: media.id, kind: stored.kind };
  } catch (error) {
    await removeFile(stored.key).catch((cleanupError) => console.error("[case-workflow] failed to remove rejected upload:", cleanupError));
    throw error;
  }
}

export async function readWorkflowMedia(id: string) {
  const [media] = await db.select().from(workflowCaseMedia).where(eq(workflowCaseMedia.id, id)).limit(1);
  if (!media) throw ApiError.notFound("File");
  const filePath = pathFor(media.storageKey);
  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat) throw ApiError.notFound("File");
  return { media, filePath, size: stat.size };
}
