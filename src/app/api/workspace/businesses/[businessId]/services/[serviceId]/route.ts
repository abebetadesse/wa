import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { archiveService, saveService, serviceInput } from "@/server/marketplace/catalogue";

const params = z.object({ businessId: z.string().uuid(), serviceId: z.string().uuid() });

export const PUT = defineRoute({
  access: "user",
  params,
  body: serviceInput,
  handler: ({ user, params, body }) => saveService(user, params.businessId, params.serviceId, body),
  audit: { action: "service_updated", resourceType: "service", resourceId: ({ params }) => params.serviceId },
});

export const DELETE = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => archiveService(user, params.businessId, params.serviceId),
  audit: { action: "service_archived", resourceType: "service", resourceId: ({ params }) => params.serviceId },
});
