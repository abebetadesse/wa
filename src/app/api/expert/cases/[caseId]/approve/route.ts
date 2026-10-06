import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { draftInput } from "@/server/cases/schemas";
import { caseService } from "@/server/cases/service";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({
    checklist: z.record(z.boolean()),
    notes: z.string().trim().max(4000).optional(),
    draft: draftInput.optional(),
  }),
  handler: ({ user, params, body }) => caseService.approve(user, params.caseId, body),
  audit: {
    action: "case_report_approved",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ body }) => ({ edited: Boolean(body.draft), checklist: body.checklist }),
  },
});
