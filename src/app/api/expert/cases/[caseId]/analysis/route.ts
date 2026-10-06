import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { caseService } from "@/server/cases/service";

/** Runs the knowledge strands and engines over the request again. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 20, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.reanalyse(user, params.caseId),
  audit: { action: "case_reanalysed", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
