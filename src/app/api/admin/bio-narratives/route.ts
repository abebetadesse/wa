import { defineRoute } from "@/lib/api/route";
import { z } from "zod";
import { db } from "@/lib/db";
import { bioNarrativeReports, users, userProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const GET = defineRoute({
  access: { roles: ["super_admin", "admin", "editor", "reviewer", "analyst"] },
  query: z.object({
    status: z.enum(["draft", "pending_endorsement", "endorsed", "published", "all"]).optional().default("pending_endorsement"),
  }),
  handler: async ({ query }) => {
    let baseQuery = db
      .select({
        id: bioNarrativeReports.id,
        userId: bioNarrativeReports.userId,
        status: bioNarrativeReports.status,
        generatedAt: bioNarrativeReports.generatedAt,
        endorsedAt: bioNarrativeReports.endorsedAt,
        publishedAt: bioNarrativeReports.publishedAt,
        endorsedBy: bioNarrativeReports.endorsedBy,
        userName: users.name,
        userEmail: users.email,
        primaryName: userProfiles.primaryName,
        birthLocation: userProfiles.birthLocation,
      })
      .from(bioNarrativeReports)
      .leftJoin(users, eq(bioNarrativeReports.userId, users.id))
      .leftJoin(userProfiles, eq(bioNarrativeReports.userId, userProfiles.userId))
      .orderBy(desc(bioNarrativeReports.createdAt));

    const rows = await baseQuery;
    const filtered = query.status === "all" ? rows : rows.filter((r) => r.status === query.status);

    return {
      reports: filtered.map((r) => ({
        ...r,
        generatedAt: r.generatedAt?.toISOString(),
        endorsedAt: r.endorsedAt?.toISOString(),
        publishedAt: r.publishedAt?.toISOString(),
      })),
    };
  },
});
