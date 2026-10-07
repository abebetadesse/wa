import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { enhanceInput } from "@/server/cases/schemas";
import { caseService } from "@/server/cases/service";

/** "AI" on a report section: returns a fuller version of that section for the reviewer's editor (not saved). */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 40, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  body: enhanceInput,
  handler: ({ user, params, body }) => caseService.enhanceSection(user, params.caseId, body),
  audit: { action: "case_section_enhanced", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
