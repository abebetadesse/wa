import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { moveStock, stockInput } from "@/server/marketplace/engagement";

export const POST = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), remedyId: z.string().uuid() }),
  body: stockInput,
  handler: ({ user, params, body }) => moveStock(user, params.businessId, params.remedyId, body),
  audit: { action: "stock_moved", resourceType: "remedy", resourceId: ({ params }) => params.remedyId, details: ({ body }) => ({ quantity: body.quantity, reason: body.reason }) },
});
