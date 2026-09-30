import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { reviewInput, reviewManualPayment } from "@/server/payments";

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ paymentId: z.string().uuid() }),
  body: reviewInput,
  handler: ({ user, params, body }) => reviewManualPayment(user, params.paymentId, body),
  audit: {
    action: ({ body }) => (body.decision === "paid" ? "platform_payment_confirmed" : "platform_payment_rejected"),
    resourceType: "platform_payment",
    resourceId: ({ params }) => params.paymentId,
    details: ({ body }, result) => ({ decision: body.decision, note: body.note ?? null, status: result.status, amountEtb: result.amountEtb }),
  },
});
