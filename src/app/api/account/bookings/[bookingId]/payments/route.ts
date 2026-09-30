import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { bookingPaymentsForClient, clientPaymentInput, submitClientPayment } from "@/server/marketplace/operations";

const params = z.object({ bookingId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => bookingPaymentsForClient(user, params.bookingId) });

export const POST = defineRoute({
  access: "user",
  params,
  body: clientPaymentInput,
  status: 201,
  rateLimit: { limit: 10, windowMs: 15 * 60_000 },
  handler: ({ user, params, body }) => submitClientPayment(user, params.bookingId, body),
  audit: {
    action: "client_payment_submitted",
    resourceType: "booking",
    resourceId: ({ params }) => params.bookingId,
    details: ({ body }) => ({ method: body.method, amountEtb: body.amountEtb, reference: body.reference }),
  },
});
