import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { WORKFLOW_DOMAINS } from "@/server/cases/types";

export const POST = defineRoute({
  access: "user",
  status: 201,
  params: z.object({ domain: z.enum(WORKFLOW_DOMAINS) }),
  body: z.object({ safetyAnswers: z.record(z.unknown()), answers: z.record(z.unknown()).default({}) }),
  handler: ({ user, params, body }) => caseService.start(user, params.domain, body),
  audit: {
    action: "case_started",
    resourceType: "workflow_case",
    resourceId: (_ctx, view) => view.id,
    details: ({ params }, view) => ({ domain: params.domain, stage: view.stage, safety: view.safety.action }),
  },
});
