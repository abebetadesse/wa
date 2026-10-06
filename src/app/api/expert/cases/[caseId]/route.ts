import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { draftInput } from "@/server/cases/schemas";
import { caseService } from "@/server/cases/service";

const params = z.object({ caseId: z.string().uuid() });

export const GET = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => caseService.getForExpert(user, params.caseId),
});

/** Saves the reviewer's edits to the report without releasing it. */
export const PATCH = defineRoute({
  access: "user",
  params,
  body: z.object({ draft: draftInput }),
  handler: ({ user, params, body }) => caseService.saveDraft(user, params.caseId, body.draft),
  audit: { action: "case_report_edited", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
