import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getHours, hoursInput, replaceHours } from "@/server/marketplace/catalogue";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => getHours(user, params.businessId) });

export const PUT = defineRoute({
  access: "user",
  params,
  body: hoursInput,
  handler: ({ user, params, body }) => replaceHours(user, params.businessId, body),
  audit: { action: "hours_updated", resourceType: "business", resourceId: ({ params }) => params.businessId },
});
