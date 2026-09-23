import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

const section = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().optional(),
  items: z.array(z.string()).optional(),
  locked: z.boolean(),
  cultural: z.boolean().optional(),
  data: z.record(z.unknown()).optional(),
});

export const POST = defineRoute({
  access: { roles: ["expert", "practitioner", "admin", "super_admin"] },
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({
    checklist: z.record(z.boolean()),
    notes: z.string().trim().max(4000).optional(),
    draft: z
      .object({
        title: z.string().min(1),
        summary: z.string().min(1),
        sections: z.array(section),
        disclaimer: z.string().min(1),
        generatedAt: z.string(),
        aiAssisted: z.boolean(),
      })
      .optional(),
  }),
  handler: ({ user, params, body }) => caseService.approve(user, params.caseId, body),
  audit: {
    action: "case_report_approved",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ body }) => ({ edited: Boolean(body.draft), checklist: body.checklist }),
  },
});
