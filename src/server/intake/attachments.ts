/** Intake media: clients upload before booking; the business team sees them once attached. */
import fs from "node:fs/promises";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { intakeAttachments, serviceIntakeSettings, services } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { membershipsOf, roleCan, type MemberRole } from "@/server/marketplace/access";
import { assertUploadQuota, toConfig } from "./settings";
import { ATTACHMENT_KINDS, pathFor, removeFile, storeFile, type AttachmentKind } from "./storage";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function uploadAttachment(user: AuthenticatedUser, input: { serviceId: string; kind: string; file: File }) {
  if (!(ATTACHMENT_KINDS as readonly string[]).includes(input.kind)) throw ApiError.badRequest("Unknown attachment type.");
  const kind = input.kind as AttachmentKind;
  const [service] = await db
    .select({ id: services.id, businessId: services.businessId, isActive: services.isActive })
    .from(services)
    .where(eq(services.id, input.serviceId))
    .limit(1);
  if (!service || !service.isActive) throw ApiError.notFound("Service");
  const [row] = await db.select().from(serviceIntakeSettings).where(eq(serviceIntakeSettings.serviceId, service.id)).limit(1);
  const config = toConfig(row);
  const allowed = { image: config.allowImage, audio: config.allowAudio, video: config.allowVideo }[kind];
  if (!allowed) throw ApiError.badRequest(`This service does not accept ${kind === "audio" ? "voice notes" : `${kind}s`}.`);
  await assertUploadQuota(user.id);

  const stored = await storeFile(input.file, kind);
  try {
    const [attachment] = await db
      .insert(intakeAttachments)
      .values({ businessId: service.businessId, uploaderId: user.id, kind: stored.kind, mimeType: stored.mime, sizeBytes: stored.size, storageKey: stored.key, originalName: input.file.name?.slice(0, 200) || null, sha256: stored.sha256 })
      .returning({ id: intakeAttachments.id, kind: intakeAttachments.kind, mimeType: intakeAttachments.mimeType, sizeBytes: intakeAttachments.sizeBytes });
    return attachment;
  } catch (error) {
    await removeFile(stored.key).catch(() => null);
    throw error;
  }
}

/** Links a client's validated uploads to their new booking (inside the booking transaction). */
export async function attachToBooking(tx: Tx, userId: string, businessId: string, bookingId: string, ids: string[]) {
  if (!ids.length) return;
  await tx
    .update(intakeAttachments)
    .set({ bookingId })
    .where(and(inArray(intakeAttachments.id, ids), eq(intakeAttachments.uploaderId, userId), eq(intakeAttachments.businessId, businessId), isNull(intakeAttachments.bookingId)));
}

/** The uploader can always see their file; the business team can once it belongs to a booking. */
export async function readAttachment(user: AuthenticatedUser, id: string) {
  const [row] = await db.select().from(intakeAttachments).where(eq(intakeAttachments.id, id)).limit(1);
  if (!row) throw ApiError.notFound("File");
  let allowed = row.uploaderId === user.id;
  if (!allowed && row.bookingId) {
    const membership = (await membershipsOf(user.id)).find((m) => m.businessId === row.businessId);
    allowed = Boolean(membership && roleCan(membership.role as MemberRole, "viewClientNotes"));
  }
  if (!allowed) throw ApiError.notFound("File");
  const filePath = pathFor(row.storageKey);
  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat) throw ApiError.notFound("File");
  return { row, filePath, size: stat.size };
}

export async function attachmentsForBooking(bookingId: string) {
  return db
    .select({ id: intakeAttachments.id, kind: intakeAttachments.kind, mimeType: intakeAttachments.mimeType, sizeBytes: intakeAttachments.sizeBytes, originalName: intakeAttachments.originalName, createdAt: intakeAttachments.createdAt })
    .from(intakeAttachments)
    .where(eq(intakeAttachments.bookingId, bookingId));
}

