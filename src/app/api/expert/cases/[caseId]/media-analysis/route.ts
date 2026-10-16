import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { caseService } from "@/server/cases/service";

export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 5, windowMs: 60 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({ mediaId: z.string().uuid() }),
  handler: ({ user, params, body }) => caseService.analyseMedia(user, params.caseId, body.mediaId),
  audit: {
    action: "case_media_ai_analysis",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
  },
});
