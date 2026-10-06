import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { messageInput } from "@/server/cases/schemas";
import { caseService } from "@/server/cases/service";

/** The reviewer writes to the person; it is delivered in the app and to their Telegram / WhatsApp. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 30, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  body: messageInput,
  handler: ({ user, params, body }) => caseService.message(user, params.caseId, body),
  audit: {
    action: "case_message_sent",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ body }) => ({ kind: body.kind }),
  },
});
