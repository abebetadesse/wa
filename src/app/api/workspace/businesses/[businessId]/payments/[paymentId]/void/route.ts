import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { voidPayment } from "@/server/marketplace/operations";

export const POST = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), paymentId: z.string().uuid() }),
  body: z.object({ reason: z.string().trim().min(3, "Give a reason for voiding.").max(500) }),
  handler: ({ user, params, body }) => voidPayment(user, params.businessId, params.paymentId, body.reason),
  audit: { action: "payment_voided", resourceType: "payment", resourceId: ({ params }) => params.paymentId, details: ({ body }) => ({ reason: body.reason }) },
});
