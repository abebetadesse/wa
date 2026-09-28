import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { clientInput, clientQuery, listClients, saveClient } from "@/server/marketplace/operations";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, query: clientQuery, handler: ({ user, params, query }) => listClients(user, params.businessId, query) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: clientInput,
  handler: ({ user, params, body }) => saveClient(user, params.businessId, null, body),
  audit: { action: "client_created", resourceType: "business_client", resourceId: (_ctx, client) => client.id },
});
