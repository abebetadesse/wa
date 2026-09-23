import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.submit(user, params.caseId),
  audit: { action: "case_submitted", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
