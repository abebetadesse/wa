import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listPayments, paymentInput, paymentQuery, recordPayment } from "@/server/marketplace/operations";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, query: paymentQuery, handler: ({ user, params, query }) => listPayments(user, params.businessId, query) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: paymentInput,
  handler: ({ user, params, body }) => recordPayment(user, params.businessId, body),
  audit: {
    action: "payment_recorded",
    resourceType: "payment",
    resourceId: (_ctx, payment) => payment.id,
    details: ({ body }) => ({ amountEtb: body.amountEtb, method: body.method, bookingId: body.bookingId ?? null }),
  },
});
