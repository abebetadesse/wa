import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { hexacoreFrequencyHistory } from "@/lib/db/schema";
import { requireUser } from "@/lib/api/authGuard";
import { ok, unauthorized } from "@/lib/api/response";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();
  const snapshots = await db.select({
    recordedAt: hexacoreFrequencyHistory.recordedAt,
    frequencies: hexacoreFrequencyHistory.frequencies,
    dominantCore: hexacoreFrequencyHistory.dominantCore,
    source: hexacoreFrequencyHistory.source,
  }).from(hexacoreFrequencyHistory).where(eq(hexacoreFrequencyHistory.userId, user.id)).orderBy(desc(hexacoreFrequencyHistory.recordedAt)).limit(90);
  return ok(snapshots);
}
