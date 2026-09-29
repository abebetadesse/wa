import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
const params = z.object({ businessId: z.string().uuid(), caseId: z.string().uuid() });

export const POST = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => caseService.claim(user, params.caseId),
  audit: { action: "case_claimed", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId, details: ({ params }) => ({ businessId: params.businessId }) },
});

export const DELETE = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => caseService.release(user, params.caseId),
  audit: { action: "case_released", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
