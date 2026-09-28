import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { businessInput, getWorkspaceBusiness, updateBusiness } from "@/server/marketplace/businesses";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => getWorkspaceBusiness(user, params.businessId) });

export const PUT = defineRoute({
  access: "user",
  params,
  body: businessInput,
  handler: ({ user, params, body }) => updateBusiness(user, params.businessId, body),
  audit: { action: "business_updated", resourceType: "business", resourceId: ({ params }) => params.businessId },
});
