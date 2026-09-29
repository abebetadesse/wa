import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
const params = z.object({ businessId: z.string().uuid(), caseId: z.string().uuid() });

export const POST = defineRoute({
  access: "user",
  params,
  body: z.object({
    checklist: z.record(z.boolean()),
    notes: z.string().trim().max(4000).optional(),
  }),
  handler: ({ user, params, body }) => caseService.approve(user, params.caseId, body),
  audit: {
    action: "case_report_approved",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ params, body }) => ({ businessId: params.businessId, checklist: body.checklist }),
  },
});
