import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { hexacoreFrequencyHistory, hexacoreJournal, users, userProfiles } from "@/lib/db/schema";
import { requireUser } from "@/lib/api/authGuard";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { HexacoreEngine, type Core } from "@/lib/hexacore/HexacoreEngine";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();
  try {
    const [account] = await db.select({ dateOfBirth: users.dateOfBirth }).from(users).where(eq(users.id, user.id)).limit(1);
    const [profile] = await db.select({ data: userProfiles.data }).from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1);
    const frequencies = (profile?.data?.hexacoreFrequencies || {}) as Partial<Record<Core, number>>;
    const journal = await db.select({
      entryDate: hexacoreJournal.entryDate,
      selectedCore: hexacoreJournal.selectedCore,
      practiceCompleted: hexacoreJournal.practiceCompleted,
    }).from(hexacoreJournal).where(eq(hexacoreJournal.userId, user.id)).orderBy(desc(hexacoreJournal.entryDate)).limit(30);
    const reading = HexacoreEngine.compute({ user: { dateOfBirth: account?.dateOfBirth, frequencies }, recentJournal: journal });
    await db.insert(hexacoreFrequencyHistory).values({
      userId: user.id,
      frequencies: reading.frequencies,
      dominantCore: reading.activeCores.primary,
      source: "seasonal",
    });
    return ok(reading);
  } catch (caught) {
    console.error("Hexacore reading failed:", caught);
    return serverError("Unable to build the Hexacore reading.");
  }
}
