import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.claim(user, params.caseId),
  audit: { action: "case_claimed", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});

export const DELETE = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.release(user, params.caseId),
  audit: { action: "case_released", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
