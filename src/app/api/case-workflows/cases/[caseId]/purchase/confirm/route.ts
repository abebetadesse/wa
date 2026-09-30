import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({ purchaseId: z.string().min(1).max(64) }),
  rateLimit: { limit: 30, windowMs: 15 * 60_000 },
  handler: ({ user, params, body }) => caseService.confirmPurchase(user, params.caseId, body.purchaseId),
  audit: {
    action: "case_payment_confirmed",
    resourceType: "workflow_case",
    resourceId: ({ params }) => params.caseId,
    details: ({ body }) => ({ purchaseId: body.purchaseId }),
  },
});
