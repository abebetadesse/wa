import { defineRoute, ApiError } from "@/lib/api/route";
import { z } from "zod";
import { db } from "@/lib/db";
import { bioNarrativeReports, users, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { BioNarrativeSections } from "@/lib/profiling/bioNarrative/types";
import { updateReturning } from "@/lib/db/write";

// ─── GET /api/admin/bio-narratives/[id] ───────────────────────────────────────

export const GET = defineRoute({
  access: { roles: ["super_admin", "admin", "editor", "reviewer", "analyst"] },
  params: z.object({ id: z.string() }),
  handler: async ({ params }) => {
    const [report] = await db
      .select({
        id: bioNarrativeReports.id,
        userId: bioNarrativeReports.userId,
        status: bioNarrativeReports.status,
        sections: bioNarrativeReports.sections,
          regionalContextSections: bioNarrativeReports.regionalContextSections,
          screeningPrompts: bioNarrativeReports.screeningPrompts,
          containsHealthContent: bioNarrativeReports.containsHealthContent,
          requiresHumanReview: bioNarrativeReports.requiresHumanReview,
          hasCulturalContent: bioNarrativeReports.hasCulturalContent,
        calculations: bioNarrativeReports.calculations,
        disclaimer: bioNarrativeReports.disclaimer,
        generatedAt: bioNarrativeReports.generatedAt,
        endorsedBy: bioNarrativeReports.endorsedBy,
        endorsedAt: bioNarrativeReports.endorsedAt,
        publishedAt: bioNarrativeReports.publishedAt,
        returnedWithComments: bioNarrativeReports.returnedWithComments,
        auditEvents: bioNarrativeReports.auditEvents,
        userName: users.name,
        userEmail: users.email,
        primaryName: userProfiles.primaryName,
        birthDate: userProfiles.birthDate,
        birthLocation: userProfiles.birthLocation,
      })
      .from(bioNarrativeReports)
      .leftJoin(users, eq(bioNarrativeReports.userId, users.id))
      .leftJoin(userProfiles, eq(bioNarrativeReports.userId, userProfiles.userId))
      .where(eq(bioNarrativeReports.id, params.id))
      .limit(1);

    if (!report) {
      throw ApiError.notFound("Bio-narrative report");
    }

    return {
      report: {
        ...report,
        generatedAt: report.generatedAt?.toISOString(),
        endorsedAt: report.endorsedAt?.toISOString(),
        publishedAt: report.publishedAt?.toISOString(),
      },
    };
  },
});

// ─── PATCH /api/admin/bio-narratives/[id] ─────────────────────────────────────

export const PATCH = defineRoute({
  access: { roles: ["super_admin", "admin", "editor", "reviewer", "analyst"] },
  params: z.object({ id: z.string() }),
  body: z.object({
    sections: z.record(z.string()).optional(),
    action: z.enum(["endorse", "return", "update_sections", "publish"]).optional(),
    comments: z.string().optional(),
  }),
  audit: {
    action: "bio_narrative_reviewed",
    resourceType: "bio_narrative_report",
    resourceId: (ctx) => ctx.params.id,
    details: (ctx) => ({ action: ctx.body.action }),
  },
  handler: async ({ params, body, user }) => {
    const [existing] = await db
      .select()
      .from(bioNarrativeReports)
      .where(eq(bioNarrativeReports.id, params.id))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound("Bio-narrative report");
    }

    let updatedSections = (existing.sections as BioNarrativeSections) || {};
    if (body.sections) {
      updatedSections = { ...updatedSections, ...body.sections } as BioNarrativeSections;
    }

    let nextStatus = existing.status;
    let publishedAt = existing.publishedAt;
    let endorsedBy = existing.endorsedBy;
    let endorsedAt = existing.endorsedAt;
    let returnedWithComments = existing.returnedWithComments;

    const existingAudit = (existing.auditEvents as Array<Record<string, unknown>>) || [];
    const newAuditEvents = [...existingAudit];

    if (body.action === "endorse") {
      nextStatus = "endorsed";
      endorsedBy = {
        role: user.role,
        name: user.name || user.email,
        date: new Date().toISOString(),
      };
      endorsedAt = new Date();
      returnedWithComments = null;
      newAuditEvents.push({
        action: "endorsed",
        timestamp: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
      });
    } else if (body.action === "publish") {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw ApiError.forbidden("Only administrators can publish reviewed bio-narratives.");
      }
      if (existing.status !== "endorsed" || !existing.endorsedAt) {
        throw ApiError.badRequest("A bio-narrative must be endorsed before publication.");
      }
      nextStatus = "published";
      publishedAt = new Date();
      newAuditEvents.push({
        action: "published",
        timestamp: publishedAt.toISOString(),
        actorId: user.id,
        actorName: user.name,
      });
    } else if (body.action === "return") {
      nextStatus = "draft";
      returnedWithComments = body.comments || "Returned for revision by reviewer.";
      newAuditEvents.push({
        action: "returned",
        timestamp: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
        comments: returnedWithComments,
      });
    } else if (body.sections) {
      newAuditEvents.push({
        action: "sections_edited",
        timestamp: new Date().toISOString(),
        actorId: user.id,
        actorName: user.name,
      });
    }

    const [updated] = await updateReturning(db, bioNarrativeReports, {
        sections: updatedSections,
        status: nextStatus,
        publishedAt,
        endorsedBy,
        endorsedAt,
        returnedWithComments,
        auditEvents: newAuditEvents,
        updatedAt: new Date(),
      }, eq(bioNarrativeReports.id, params.id));

    return {
      report: {
        id: updated.id,
        status: updated.status,
        publishedAt: updated.publishedAt?.toISOString(),
        sections: updated.sections,
        endorsedBy: updated.endorsedBy,
        endorsedAt: updated.endorsedAt?.toISOString(),
        returnedWithComments: updated.returnedWithComments,
      },
    };
  },
});
