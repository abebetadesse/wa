import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { remedyInput, saveRemedy } from "@/server/marketplace/engagement";

export const PUT = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), remedyId: z.string().uuid() }),
  body: remedyInput,
  handler: ({ user, params, body }) => saveRemedy(user, params.businessId, params.remedyId, body),
  audit: { action: "remedy_updated", resourceType: "remedy", resourceId: ({ params }) => params.remedyId },
});
