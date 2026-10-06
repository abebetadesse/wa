import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { replyInput } from "@/server/cases/schemas";
import { caseService } from "@/server/cases/service";

/** The case owner writes to their reviewer. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 30, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  body: replyInput,
  handler: ({ user, params, body }) => caseService.reply(user, params.caseId, body.body),
  audit: { action: "case_reply_sent", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
