import { defineRoute, ApiError } from "@/lib/api/route";
import { z } from "zod";
import { db } from "@/lib/db";
import { caseSummaryCards } from "@/lib/db/schema";
import { validateSummaryCardForSession, type SuggestedStrandDetail } from "@/lib/case-workflow/caseSummaryEngine";
import { eq, and } from "drizzle-orm";
import { updateReturning } from "@/lib/db/write";

// ─── POST /api/case/summary/[id]/endorse ─────────────────────────────────────
// User confirms that the AI-generated case summary card accurately represents
// their concern before the formal session is started.
// ─────────────────────────────────────────────────────────────────────────────

export const POST = defineRoute({
  access: "user",
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    confirmed: z.boolean(),
  }),
  audit: {
    action: "case_summary_endorsed",
    resourceType: "case_summary_card",
    resourceId: (ctx) => ctx.params.id,
    details: (ctx) => ({ confirmed: ctx.body.confirmed }),
  },
  handler: async ({ user, params, body }) => {
    if (!body.confirmed) {
      throw ApiError.badRequest(
        "You must confirm the case summary to proceed. If you wish to edit your " +
          "description, please submit a new narrative."
      );
    }

    // Load the card and verify ownership
    const [card] = await db
      .select()
      .from(caseSummaryCards)
      .where(
        and(
          eq(caseSummaryCards.id, params.id),
          eq(caseSummaryCards.userId, user.id)
        )
      )
      .limit(1);

    if (!card) {
      throw ApiError.notFound("Case summary card");
    }

    if (card.endorsedByUser) {
      // Already endorsed — idempotent
      return {
        cardId: card.id,
        endorsedByUser: true,
        endorsedAt: card.endorsedAt?.toISOString(),
        canStartSession: true,
        domain: card.domain,
        suggestedStrands: card.suggestedStrands,
      };
    }

    // Safety gate check (validates card has sufficient detail to start a session)
    const gate = validateSummaryCardForSession({
      ...card,
      aiTranslation: card.aiTranslation || undefined,
      keySymptoms: (card.keySymptoms as string[]) || [],
      suggestedStrands: (card.suggestedStrands as string[]) as never,
      suggestedStrandDetails: (card.suggestedStrandDetails as SuggestedStrandDetail[]) || [],
      urgencyFlag: (card.urgencyFlag as "none" | "watch" | "urgent" | "emergency") || "none",
      aiConfidence: card.aiConfidence || 0,
      headline: card.headline || "",
      domain: (card.domain as "wellbeing" | "relationships" | "career" | "legal" | "social" | "spiritual") || "wellbeing",
      subDomain: card.subDomain || "general",
      userIntention: card.userIntention || "",
      endorsedByUser: true, // simulate endorsed for gate check
      rawNarrative: card.rawNarrative,
    });

    if (!gate.allowed) {
      throw ApiError.badRequest(gate.reason || "Cannot proceed with this case summary.");
    }

    // Mark as endorsed
    const now = new Date();
    const [updated] = await updateReturning(db, caseSummaryCards, { endorsedByUser: true, endorsedAt: now }, eq(caseSummaryCards.id, params.id));

    return {
      cardId: updated.id,
      endorsedByUser: true,
      endorsedAt: updated.endorsedAt?.toISOString(),
      canStartSession: true,
      domain: updated.domain,
      suggestedStrands: updated.suggestedStrands,
    };
  },
});
