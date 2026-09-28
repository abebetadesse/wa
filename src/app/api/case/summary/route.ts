import { defineRoute, ApiError } from "@/lib/api/route";
import { z } from "zod";
import { db } from "@/lib/db";
import { caseSummaryCards } from "@/lib/db/schema";
import { parseCaseNarrative } from "@/lib/case-workflow/caseSummaryEngine";

// ─── POST /api/case/summary ───────────────────────────────────────────────────
// Accepts a free-expression narrative and returns a structured CaseSummaryCard.
// The card must be endorsed by the user before a formal session can begin.
// ─────────────────────────────────────────────────────────────────────────────

export const POST = defineRoute({
  access: "user",
  body: z.object({
    narrative: z.string().trim().min(10).max(5000),
    preferredLanguage: z.enum(["en", "am"]).optional(),
    /** Optional voice transcription source flag (does not affect logic, stored for audit) */
    inputMode: z.enum(["text", "voice"]).optional(),
  }),
  audit: {
    action: "case_summary_generated",
    resourceType: "case_summary_card",
    resourceId: (ctx) => ctx.user.id,
    details: (ctx) => ({
      inputMode: ctx.body.inputMode || "text",
      preferredLanguage: ctx.body.preferredLanguage || "en",
    }),
  },
  handler: async ({ user, body }) => {
    // Parse narrative into a structured card (pure local computation, no LLM)
    const card = parseCaseNarrative(
      body.narrative,
      body.preferredLanguage || "en"
    );

    // Persist the card to the database so the user can review and endorse it
    const [saved] = await db
      .insert(caseSummaryCards)
      .values({
        userId: user.id,
        rawNarrative: card.rawNarrative,
        aiTranslation: card.aiTranslation || null,
        headline: card.headline,
        domain: card.domain,
        subDomain: card.subDomain,
        userIntention: card.userIntention,
        keySymptoms: card.keySymptoms,
        emergencyDetected: card.emergencyDetected,
        emergencySignals: card.emergencySignals,
        emergencyRoutedAt: card.emergencyDetected ? new Date() : null,
        urgencyFlag: card.urgencyFlag,
        aiConfidence: card.aiConfidence,
        suggestedStrands: card.suggestedStrands,
        suggestedStrandDetails: card.suggestedStrandDetails,
        endorsedByUser: false,
        createdAt: new Date(),
      })
      .returning();

    // Emergency flag: instruct the caller to route to crisis flow immediately
    const isCrisis = card.urgencyFlag === "emergency";

    return {
      card: {
        id: saved.id,
        headline: saved.headline,
        domain: saved.domain,
        subDomain: saved.subDomain,
        userIntention: saved.userIntention,
        keySymptoms: saved.keySymptoms,
        emergencyDetected: saved.emergencyDetected,
        emergencySignals: saved.emergencySignals,
        urgencyFlag: saved.urgencyFlag,
        aiConfidence: saved.aiConfidence,
        suggestedStrands: saved.suggestedStrands,
        suggestedStrandDetails: saved.suggestedStrandDetails,
        endorsedByUser: false,
        ...(isCrisis ? { crisisMessage: card.crisisMessage } : {}),
      },
      isCrisis,
      ...(isCrisis ? { emergencyRoute: "/emergency" } : {}),
      requiresEndorsement: true,
    };
  },
});
