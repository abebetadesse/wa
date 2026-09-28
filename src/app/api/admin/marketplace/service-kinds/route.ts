import { defineRoute } from "@/lib/api/route";
import { listServiceKinds, serviceKindInput, upsertServiceKind } from "@/server/marketplace/catalogue";

export const GET = defineRoute({ access: { roles: ["admin", "super_admin"] }, handler: () => listServiceKinds(true) });

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  status: 201,
  body: serviceKindInput,
  handler: ({ body }) => upsertServiceKind(null, body),
  audit: { action: "service_kind_created", resourceType: "service_kind", resourceId: (_ctx, row) => row.id },
});
