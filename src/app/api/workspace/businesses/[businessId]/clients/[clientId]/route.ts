import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { clientInput, getClient, saveClient } from "@/server/marketplace/operations";

const params = z.object({ businessId: z.string().uuid(), clientId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => getClient(user, params.businessId, params.clientId) });

export const PUT = defineRoute({
  access: "user",
  params,
  body: clientInput,
  handler: ({ user, params, body }) => saveClient(user, params.businessId, params.clientId, body),
  audit: { action: "client_updated", resourceType: "business_client", resourceId: ({ params }) => params.clientId },
});
