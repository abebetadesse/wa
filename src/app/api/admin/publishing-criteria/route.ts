import { defineRoute, ApiError } from "@/lib/api/route";
import { z } from "zod";
import { db } from "@/lib/db";
import { publishingCriteria, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ─── GET /api/admin/publishing-criteria ──────────────────────────────────────
// Returns the current publishing criteria singleton.
// ─────────────────────────────────────────────────────────────────────────────

export const GET = defineRoute({
  access: { roles: ["super_admin", "admin"] },
  handler: async () => {
    const [criteria] = await db.select().from(publishingCriteria).limit(1);
    if (!criteria) {
      // Return sensible defaults when no row exists yet
      return {
        criteria: {
          id: null,
          allowAutoPublishBioNarrative: false,
          allowAutoPublishCases: false,
          autoPublishIfDomainIn: [],
          requireProfessionalReviewForDomains: [],
          requireAdminApprovalForDomains: [],
          maxAutoPublishAiConfidence: 90,
          updatedAt: null,
        },
      };
    }
    return {
      criteria: {
        id: criteria.id,
        allowAutoPublishBioNarrative: criteria.allowAutoPublishBioNarrative,
        allowAutoPublishCases: criteria.allowAutoPublishCases,
        autoPublishIfDomainIn: criteria.autoPublishIfDomainIn || [],
        requireProfessionalReviewForDomains:
          criteria.requireProfessionalReviewForDomains || [],
        requireAdminApprovalForDomains:
          criteria.requireAdminApprovalForDomains || [],
        maxAutoPublishAiConfidence: criteria.maxAutoPublishAiConfidence,
        updatedAt: criteria.updatedAt?.toISOString() || null,
      },
    };
  },
});

// ─── PUT /api/admin/publishing-criteria ──────────────────────────────────────
// Upserts the publishing criteria singleton. Only super_admin / admin can write.
// ─────────────────────────────────────────────────────────────────────────────

const criteriaBodySchema = z.object({
  allowAutoPublishBioNarrative: z.boolean().optional(),
  allowAutoPublishCases: z.boolean().optional(),
  autoPublishIfDomainIn: z.array(z.string()).optional(),
  requireProfessionalReviewForDomains: z.array(z.string()).optional(),
  requireAdminApprovalForDomains: z.array(z.string()).optional(),
  maxAutoPublishAiConfidence: z.number().int().min(0).max(100).optional(),
});

export const PUT = defineRoute({
  access: { roles: ["super_admin", "admin"] },
  body: criteriaBodySchema,
  audit: {
    action: "publishing_criteria_updated",
    resourceType: "publishing_criteria",
    resourceId: () => "singleton",
    details: (ctx) => ctx.body,
  },
  handler: async ({ user, body }) => {
    const [existing] = await db.select().from(publishingCriteria).limit(1);

    const now = new Date();

    if (existing) {
      // Update existing row
      const [updated] = await db
        .update(publishingCriteria)
        .set({
          ...(body.allowAutoPublishBioNarrative !== undefined
            ? { allowAutoPublishBioNarrative: body.allowAutoPublishBioNarrative }
            : {}),
          ...(body.allowAutoPublishCases !== undefined
            ? { allowAutoPublishCases: body.allowAutoPublishCases }
            : {}),
          ...(body.autoPublishIfDomainIn !== undefined
            ? { autoPublishIfDomainIn: body.autoPublishIfDomainIn }
            : {}),
          ...(body.requireProfessionalReviewForDomains !== undefined
            ? {
                requireProfessionalReviewForDomains:
                  body.requireProfessionalReviewForDomains,
              }
            : {}),
          ...(body.requireAdminApprovalForDomains !== undefined
            ? {
                requireAdminApprovalForDomains:
                  body.requireAdminApprovalForDomains,
              }
            : {}),
          ...(body.maxAutoPublishAiConfidence !== undefined
            ? { maxAutoPublishAiConfidence: body.maxAutoPublishAiConfidence }
            : {}),
          updatedBy: user.id,
          updatedAt: now,
        })
        .where(eq(publishingCriteria.id, existing.id))
        .returning();

      return { criteria: updated, created: false };
    } else {
      // Insert first-time singleton
      const [created] = await db
        .insert(publishingCriteria)
        .values({
          allowAutoPublishBioNarrative:
            body.allowAutoPublishBioNarrative ?? false,
          allowAutoPublishCases: body.allowAutoPublishCases ?? false,
          autoPublishIfDomainIn: body.autoPublishIfDomainIn ?? [],
          requireProfessionalReviewForDomains:
            body.requireProfessionalReviewForDomains ?? [],
          requireAdminApprovalForDomains:
            body.requireAdminApprovalForDomains ?? [],
          maxAutoPublishAiConfidence: body.maxAutoPublishAiConfidence ?? 90,
          updatedBy: user.id,
          updatedAt: now,
        })
        .returning();

      return { criteria: created, created: true };
    }
  },
});
