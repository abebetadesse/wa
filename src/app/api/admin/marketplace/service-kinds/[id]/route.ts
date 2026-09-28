import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { serviceKindInput, upsertServiceKind } from "@/server/marketplace/catalogue";

export const PUT = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ id: z.string().uuid() }),
  body: serviceKindInput,
  handler: ({ params, body }) => upsertServiceKind(params.id, body),
  audit: { action: "service_kind_updated", resourceType: "service_kind", resourceId: ({ params }) => params.id },
});
