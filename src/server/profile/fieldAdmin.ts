import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { profileFieldDefinitions } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import { validateFieldInput, type ProfileFieldInput } from "@/lib/profileFields";
import type { AuthenticatedUser } from "@/lib/auth";
import { insertReturning } from "@/lib/db/write";

/** Adapts the existing field validator into a zod schema so routes report 400s consistently. */
export const fieldInput = z.unknown().transform((value, ctx): ProfileFieldInput => {
  try {
    return validateFieldInput(value);
  } catch (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : "Invalid field definition." });
    return z.NEVER;
  }
});

export const fieldImport = z
  .union([z.array(z.unknown()), z.object({ fields: z.array(z.unknown()) })], { message: "Expected a fields array." })
  .transform((body) => (Array.isArray(body) ? body : body.fields))
  .pipe(z.array(fieldInput));

async function requireField(id: string) {
  const [field] = await db.select().from(profileFieldDefinitions).where(eq(profileFieldDefinitions.id, id)).limit(1);
  if (!field) throw ApiError.notFound("Field");
  return field;
}

export async function listFields() {
  const fields = await db
    .select()
    .from(profileFieldDefinitions)
    .orderBy(asc(profileFieldDefinitions.section), asc(profileFieldDefinitions.displayOrder));
  return { fields, sections: [...new Set(fields.map((field) => field.section))] };
}

export async function createField(user: AuthenticatedUser, input: ProfileFieldInput) {
  const [field] = await insertReturning(db, profileFieldDefinitions, { ...input, createdBy: user.id, updatedBy: user.id });
  return field;
}

export async function updateField(user: AuthenticatedUser, id: string, input: ProfileFieldInput) {
  await requireField(id);
  await db.update(profileFieldDefinitions).set({ ...input, updatedBy: user.id, updatedAt: new Date() }).where(eq(profileFieldDefinitions.id, id));
  return requireField(id);
}

export async function archiveField(user: AuthenticatedUser, id: string) {
  await requireField(id);
  await db.update(profileFieldDefinitions).set({ isActive: false, updatedBy: user.id, updatedAt: new Date() }).where(eq(profileFieldDefinitions.id, id));
  return requireField(id);
}

export async function reorderFields(user: AuthenticatedUser, ids: string[]) {
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx
        .update(profileFieldDefinitions)
        .set({ displayOrder: index, updatedBy: user.id, updatedAt: new Date() })
        .where(eq(profileFieldDefinitions.id, id));
    }
  });
  return { reordered: ids.length };
}

export async function importFields(user: AuthenticatedUser, fields: ProfileFieldInput[]) {
  if (!fields.length) return { fields: [], imported: 0 };
  const created = await insertReturning(db, profileFieldDefinitions, fields.map((field) => ({ ...field, createdBy: user.id, updatedBy: user.id })));
  return { fields: created, imported: created.length };
}

export async function exportFields() {
  const fields = await db.select().from(profileFieldDefinitions).orderBy(asc(profileFieldDefinitions.displayOrder));
  return { fields, exportedAt: new Date().toISOString() };
}
