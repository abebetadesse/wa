import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { manualPaymentInput } from "@/server/payments";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  body: manualPaymentInput,
  rateLimit: { limit: 10, windowMs: 15 * 60_000 },
  handler: ({ user, params, body }) => caseService.submitManualPayment(user, params.caseId, body),
  audit: {
    action: "case_payment_submitted",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ body }) => ({ method: body.method, reference: body.reference }),
  },
});
