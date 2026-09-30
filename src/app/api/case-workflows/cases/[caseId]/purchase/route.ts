import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { PAY_METHODS } from "@/server/payments";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({ method: z.enum(PAY_METHODS).default("chapa") }),
  rateLimit: { limit: 20, windowMs: 15 * 60_000 },
  handler: ({ req, user, params, body }) => caseService.purchase(user, params.caseId, body.method, req.nextUrl.origin),
  audit: {
    action: (_ctx, result) => (result.released ? "case_report_released_free" : "case_payment_started"),
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: (_ctx, result) => ({ purchaseId: result.released ? null : result.purchaseId, amountEtb: result.amountEtb }),
  },
});
