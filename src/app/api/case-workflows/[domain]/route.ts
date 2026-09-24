import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { WORKFLOW_DOMAINS } from "@/server/cases/types";

export const POST = defineRoute({
  access: "user",
  status: 201,
  params: z.object({ domain: z.enum(WORKFLOW_DOMAINS) }),
  body: z.object({
    safetyAnswers: z.record(z.unknown()),
    answers: z.record(z.unknown()).default({}),
    consent: z.object({
      dataUsage: z.boolean().default(true),
      emergencySupport: z.boolean().default(true),
      thirdPartySharing: z.boolean().default(false),
      retention: z.enum(["30_days", "90_days", "1_year", "until_closed"]).default("90_days"),
      consentTextVersion: z.string().default("v1"),
    }).optional(),
  }),
  handler: ({ user, params, body }) => caseService.start(user, params.domain, body),
  audit: {
    action: "case_started",
    resourceType: "workflow_case",
    resourceId: (_ctx, view) => view.id,
    details: ({ params }, view) => ({ domain: params.domain, stage: view.stage, safety: view.safety.action, retention: view.consent.retention }),
  },
});
