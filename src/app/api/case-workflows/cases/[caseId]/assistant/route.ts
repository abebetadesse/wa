import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { askCase, caseTurns } from "@/server/cases/assistantService";

const params = z.object({ caseId: z.string().uuid() });

/** Earlier questions about this case (the person sees their own, reviewers see all). */
export const GET = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => caseTurns(user, params.caseId),
});

/** Asks a question answered only from this case and its approved references, with citations. */
export const POST = defineRoute({
  access: "user",
  params,
  body: z.object({ question: z.string().trim().min(3).max(1000) }),
  rateLimit: { limit: 30, windowMs: 60 * 60 * 1000 },
  handler: ({ user, params, body }) => askCase(user, params.caseId, body.question),
  audit: { action: "case_assistant_question", resourceType: "workflow_case", resourceId: (ctx) => ctx.params.caseId, details: (_ctx, turn) => ({ mode: turn.mode }) },
});
