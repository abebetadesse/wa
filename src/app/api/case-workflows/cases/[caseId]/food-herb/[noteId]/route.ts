import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { caseService } from "@/server/cases/service";

export const DELETE = defineRoute({
  access: "user",
  rateLimit: { limit: 30, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid(), noteId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.removeFoodHerb(user, params.caseId, params.noteId),
  audit: { action: "case_food_herb_removed", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
