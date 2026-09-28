import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listServices, saveService, serviceInput } from "@/server/marketplace/catalogue";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => listServices(user, params.businessId) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: serviceInput,
  handler: ({ user, params, body }) => saveService(user, params.businessId, null, body),
  audit: { action: "service_created", resourceType: "service", resourceId: (_ctx, service) => service.id },
});
