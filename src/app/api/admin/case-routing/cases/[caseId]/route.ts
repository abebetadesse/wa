import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { assertCaseReviewRole } from "@/server/cases/routing";

export const PATCH = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({ role: z.string().trim().min(2).max(40) }),
  handler: async ({ user, params, body }) => {
    const role = await assertCaseReviewRole(body.role);
    return caseService.assignRole(user, params.caseId, role);
  },
  audit: {
    action: "case_request_reassigned",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ body }) => ({ role: body.role }),
  },
});
