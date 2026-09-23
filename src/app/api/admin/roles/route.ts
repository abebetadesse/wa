import { defineRoute } from "@/lib/api/route";
import { createRole, listRoles, newRole } from "@/server/admin/roles";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  handler: () => listRoles(),
});

export const POST = defineRoute({
  access: { roles: ["super_admin"] },
  status: 201,
  body: newRole,
  handler: ({ body }) => createRole(body),
  audit: {
    action: "role_created",
    resourceType: "role",
    resourceId: (_ctx, role) => role?.id,
    details: ({ body }) => ({ roleName: body.name, permissionsCount: body.permissions.length }),
  },
});
