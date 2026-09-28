import { defineRoute, ApiError } from "@/lib/api/route";
import { z } from "zod";
import { db } from "@/lib/db";
import { userProfiles, bioNarrativeReports, publishingCriteria } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateBioNarrativeReport } from "@/lib/profiling/bioNarrative/generateBioNarrative";
import type { BioNarrativeStatus } from "@/lib/profiling/bioNarrative/types";
import { canAutoPublishBioNarrative } from "@/lib/profiling/bioNarrative/publishGate";

// ─── GET /api/profile/bio-narrative ──────────────────────────────────────────

export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    const [report] = await db
      .select()
      .from(bioNarrativeReports)
      .where(eq(bioNarrativeReports.userId, user.id))
      .orderBy(desc(bioNarrativeReports.createdAt))
      .limit(1);

    if (!report) {
      return { report: null };
    }
    if (
      report.status !== "published" ||
      (report.containsHealthContent && report.requiresHumanReview)
    ) {
      return { report: null, pendingReview: true, status: report.status };
    }

    return {
      report: {
        id: report.id,
        reportId: report.id,
        userId: report.userId,
        status: report.status,
        sections: report.sections,
        regionalContextSections: report.regionalContextSections,
        screeningPrompts: report.screeningPrompts,
        containsHealthContent: report.containsHealthContent,
        requiresHumanReview: report.requiresHumanReview,
        hasCulturalContent: report.hasCulturalContent,
        disclaimer: report.disclaimer,
        generatedAt: report.generatedAt?.toISOString() || report.createdAt.toISOString(),
        publishedAt: report.publishedAt?.toISOString(),
        endorsedBy: report.endorsedBy,
        endorsedAt: report.endorsedAt?.toISOString(),
        returnedWithComments: report.returnedWithComments,
      },
    };
  },
});

// ─── POST /api/profile/bio-narrative ─────────────────────────────────────────

export const POST = defineRoute({
  access: "user",
  body: z.object({
    userId: z.string().optional(),
    preferredLanguage: z.enum(["en", "am"]).optional(),
  }),
  audit: {
    action: "bio_narrative_generated",
    resourceType: "bio_narrative_report",
    resourceId: (ctx) => ctx.user.id,
    details: (ctx) => ({ userId: ctx.user.id }),
  },
  handler: async ({ user, body }) => {
    // Server validates ownership
    if (body.userId && body.userId !== user.id && user.role !== "admin" && user.role !== "super_admin") {
      throw ApiError.forbidden("Cannot generate bio-narrative for another user account.");
    }

    // Load profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    const profileData = (profile?.data || {}) as Record<string, unknown>;
    const consent = profile?.consent ?? {
      location: profile?.consentLocation ?? false,
      spiritual: profile?.consentSpiritual ?? false,
      traditionalMedicine: false,
      bioNarrative: false,
      voiceIntake: false,
      manuscriptKnowledge: false,
    };
    if (!consent.bioNarrative) {
      throw ApiError.badRequest("Bio-narrative generation requires explicit bio-narrative consent in your profile.");
    }
    const primaryName = (profile?.primaryName || profileData.primaryName || profileData.fullName || profileData.name || user.name || "Member") as string;
    const birthDate = (profile?.birthDate || profileData.birthDate || profileData.dob) as string;
    const birthLocation = (profile?.birthLocation || profileData.birthLocation || profileData.region || "Addis Ababa") as string;
    const currentLocation = (profile?.currentLocation || profileData.currentLocation || profileData.region || birthLocation) as string;
    const motherName = (profile?.motherName || profileData.motherName || "Mariam") as string;
    const birthTime = (profile?.birthTime || profileData.birthTime || "12:00") as string;

    // Gating check: birthDate and birthLocation are required
    if (!birthDate || !birthLocation) {
      throw ApiError.badRequest("Cannot generate bio-narrative: birthDate and birthLocation must be confirmed in your profile.");
    }

    // Check publishing criteria configuration
    const [criteria] = await db.select().from(publishingCriteria).limit(1);
    const allowAutoPublish = criteria?.allowAutoPublishBioNarrative ?? false;
    const narrative = await generateBioNarrativeReport({
      userId: user.id,
      primaryName,
      birthDate: String(birthDate),
      birthTime,
      birthLocation,
      currentLocation,
      motherName,
      consent,
      preferredLanguage: body.preferredLanguage || (user.preferredLanguage === "am" ? "am" : "en"),
    });
    const autoPublishGate = canAutoPublishBioNarrative(narrative, allowAutoPublish);
    const initialStatus: BioNarrativeStatus = autoPublishGate.allowed ? "published" : "pending_endorsement";
    const publishedAt = autoPublishGate.allowed ? new Date() : null;

    // Save into database
    const [saved] = await db
      .insert(bioNarrativeReports)
      .values({
        userId: user.id,
        status: initialStatus,
        sections: narrative.sections,
        regionalContextSections: narrative.regionalContextSections,
        screeningPrompts: narrative.screeningPrompts,
        containsHealthContent: narrative.containsHealthContent,
        requiresHumanReview: narrative.requiresHumanReview,
        hasCulturalContent: narrative.hasCulturalContent,
        calculations: narrative.calculations ?? null,
        disclaimer: narrative.disclaimer,
        publishedAt,
        auditEvents: [
          {
            action: "generated",
            timestamp: new Date().toISOString(),
            actorId: user.id,
            status: initialStatus,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      report: {
        id: saved.id,
        reportId: saved.id,
        userId: saved.userId,
        status: saved.status,
        ...(autoPublishGate.allowed ? {
          sections: saved.sections,
          regionalContextSections: saved.regionalContextSections,
          screeningPrompts: saved.screeningPrompts,
          disclaimer: saved.disclaimer,
        } : {}),
        containsHealthContent: saved.containsHealthContent,
        requiresHumanReview: saved.requiresHumanReview,
        generatedAt: saved.generatedAt.toISOString(),
        publishedAt: saved.publishedAt?.toISOString(),
      },
      reviewRequired: !autoPublishGate.allowed,
      autoPublished: autoPublishGate.allowed,
      publicationReason: autoPublishGate.reason,
    };
  },
});
