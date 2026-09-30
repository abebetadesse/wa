import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { paymentReviewInput, reviewClientPayment } from "@/server/marketplace/operations";

/** Confirm or reject a payment a client reported (telebirr / bank transfer). */
export const POST = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), paymentId: z.string().uuid() }),
  body: paymentReviewInput,
  handler: ({ user, params, body }) => reviewClientPayment(user, params.businessId, params.paymentId, body),
  audit: {
    action: ({ body }) => (body.decision === "confirm" ? "client_payment_confirmed" : "client_payment_rejected"),
    resourceType: "payment",
    resourceId: ({ params }) => params.paymentId,
    details: ({ params, body }) => ({ businessId: params.businessId, reason: body.reason ?? null }),
  },
});
