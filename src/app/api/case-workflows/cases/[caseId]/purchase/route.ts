import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { PAYMENT_METHODS } from "@/server/cases/payments";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({ method: z.enum(PAYMENT_METHODS).default("telebirr") }),
  handler: ({ user, params, body }) => caseService.purchase(user, params.caseId, body.method),
  audit: {
    action: "case_payment_started",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: (_ctx, result) => ({ purchaseId: result.purchaseId, amountEtb: result.amountEtb, method: result.method }),
  },
});
