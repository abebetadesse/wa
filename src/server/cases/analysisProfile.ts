/**
 * What the platform already knows about a case owner, in the shape the knowledge strands expect.
 * Used only for the reviewer's analysis, and only when the person consented to data usage.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, wellbeingProfiles } from "@/lib/db/schema";
import type { UserProfile } from "@/lib/knowledge/types";
import { decryptRestrictedField } from "@/lib/security/encryption";

const list = (value: unknown): string[] => (Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item : typeof item === "object" && item && "name" in item ? String((item as { name: unknown }).name) : "")).filter(Boolean) : []);

function ageFrom(dateOfBirth: string | Date | null): number | undefined {
  if (!dateOfBirth) return undefined;
  const born = new Date(dateOfBirth);
  if (Number.isNaN(born.getTime())) return undefined;
  const age = Math.floor((Date.now() - born.getTime()) / (365.25 * 86_400_000));
  return age >= 0 && age < 130 ? age : undefined;
}

export async function loadAnalysisProfile(userId: string): Promise<UserProfile> {
  const [[account], [wellbeing]] = await Promise.all([
    db.select({ dateOfBirth: users.dateOfBirth, gender: users.gender, region: users.region, city: users.city, language: users.preferredLanguage }).from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(wellbeingProfiles).where(eq(wellbeingProfiles.userId, userId)).orderBy(desc(wellbeingProfiles.updatedAt)).limit(1),
  ]);
  if (!account) return {};
  const age = wellbeing?.age ?? ageFrom(account.dateOfBirth);
  const gender = wellbeing?.gender ?? account.gender ?? undefined;
  const region = wellbeing?.region ?? account.region ?? undefined;
  const medications = wellbeing ? list(decryptRestrictedField(wellbeing.medications)) : [];
  const conditions = wellbeing ? list(decryptRestrictedField(wellbeing.medicalHistory)) : [];
  return {
    userId,
    age: age ?? undefined,
    language: account.language,
    demographics: { age: age ?? undefined, gender, region, city: account.city ?? undefined },
    medications,
    conditions,
    pregnant: wellbeing ? Boolean(wellbeing.pregnancyOrLactation && wellbeing.pregnancyOrLactation !== "none") : undefined,
    wellbeing: { medications, conditions, allergies: wellbeing ? list(wellbeing.allergies) : [] },
    location: region ? { region, city: account.city ?? undefined, altitude: wellbeing?.altitudeMeters ?? undefined } : undefined,
  };
}
