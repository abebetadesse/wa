import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { diagnosticSessions } from "@/lib/db/schema";
import { defineRoute } from "@/lib/api/route";

/**
 * The signed-in user's own recent diagnostic sessions. Guests have no stored history and get an
 * empty list. The list is always scoped to the caller: there is no way to ask for another user's.
 */
export const GET = defineRoute({
  access: "public",
  query: z.object({ limit: z.coerce.number().int().min(1).max(50).catch(10) }),
  handler: async ({ user, query }) => {
    if (!user) return [];
    return db
      .select({
        id: diagnosticSessions.id,
        query: diagnosticSessions.query,
        mode: diagnosticSessions.mode,
        language: diagnosticSessions.language,
        urgencyLevel: diagnosticSessions.urgencyLevel,
        urgencyScore: diagnosticSessions.urgencyScore,
        intent: diagnosticSessions.intent,
        summary: diagnosticSessions.summary,
        createdAt: diagnosticSessions.createdAt,
      })
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.userId, user.id))
      .orderBy(desc(diagnosticSessions.createdAt))
      .limit(query.limit);
  },
});
