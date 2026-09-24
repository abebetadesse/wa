/**
 * /api/profile — Pillar 4, Point 15: Standardised on defineRoute
 *
 * Refactored from manual try/catch + manual NextResponse.json error
 * handling to the battle-tested defineRoute wrapper. This guarantees:
 *  - Universal rate-limiting (add rateLimit: {} as needed)
 *  - Consistent { success, data | error } envelope
 *  - Automatic audit logging via non-blocking queue (Pillar 1 P3)
 *  - Proper 401 vs 500 distinction handled by ApiError semantics
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { isVisible } from "@/lib/profileFields";
import { ensureProfileFieldCatalog } from "@/lib/profileFieldCatalog";
import { defineRoute, ApiError } from "@/lib/api/route";

// ─── GET /api/profile ─────────────────────────────────────────────────────────

export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

    const fields = await ensureProfileFieldCatalog();
    const data = profile?.data || {};

    const height =
      typeof data.height === "number"
        ? data.height
        : Number(data["wellbeing.height"]);
    const weight =
      typeof data.weight === "number"
        ? data.weight
        : Number(data["wellbeing.weight"]);
    const bmi =
      height > 0 && weight > 0
        ? Number((weight / (height / 100) ** 2).toFixed(1))
        : null;

    return { data, fields, computed: { bmi } };
  },
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────

export const PUT = defineRoute({
  access: "user",
  body: z.record(z.unknown()),
  audit: {
    action: "profile_updated",
    resourceType: "user_profile",
    resourceId: (ctx) => ctx.user.id,
    details: (ctx) => ({ fieldIds: Object.keys(ctx.body as Record<string, unknown>) }),
  },
  handler: async ({ user, body }) => {
    const incoming = body as Record<string, unknown>;
    const fields = await ensureProfileFieldCatalog();

    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

    const data = { ...(existing?.data || {}), ...incoming };

    for (const field of fields) {
      if (
        field.required &&
        isVisible(field, data) &&
        (data[field.id] === undefined || data[field.id] === "")
      ) {
        throw ApiError.badRequest(`${field.label} is required.`);
      }
    }

    await db
      .insert(userProfiles)
      .values({ userId: user.id, data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { data, updatedAt: new Date() },
      });

    return { data };
  },
});
