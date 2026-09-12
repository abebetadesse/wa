import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profileFieldDefinitions } from "@/lib/db/schema";
import { PROFILE_FIELD_CATALOG } from "@/lib/profileFields";

export async function ensureProfileFieldCatalog() {
  const existing = await db
    .select({ section: profileFieldDefinitions.section, label: profileFieldDefinitions.label })
    .from(profileFieldDefinitions);
  const existingKeys = new Set(existing.map((field) => `${field.section}:${field.label}`));
  const missing = PROFILE_FIELD_CATALOG.filter((field) => !existingKeys.has(`${field.section}:${field.label}`));

  if (missing.length) {
    await db.insert(profileFieldDefinitions).values(missing);
  }

  return db
    .select()
    .from(profileFieldDefinitions)
    .where(and(eq(profileFieldDefinitions.isActive, true), eq(profileFieldDefinitions.isUserVisible, true)))
    .orderBy(asc(profileFieldDefinitions.displayOrder));
}
