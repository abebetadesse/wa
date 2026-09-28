import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { decideVerification } from "@/server/marketplace/businesses";

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ businessId: z.string().uuid() }),
  body: z.object({ decision: z.enum(["verified", "draft", "suspended"]), notes: z.string().trim().max(2000).optional() }),
  handler: ({ user, params, body }) => decideVerification(user, params.businessId, body.decision, body.notes),
  audit: {
    action: ({ body }) => `business_${body.decision}`,
    resourceType: "business",
    resourceId: ({ params }) => params.businessId,
    details: ({ body }) => ({ decision: body.decision, notes: body.notes ?? null }),
  },
});
