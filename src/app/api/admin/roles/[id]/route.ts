import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { deleteRole, getRole, rolePatch, updateRole } from "@/server/admin/roles";

const params = z.object({ id: z.string().min(1) });

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params,
  handler: ({ params }) => getRole(params.id),
});

export const PUT = defineRoute({
  access: { roles: ["super_admin"] },
  params,
  body: rolePatch,
  handler: async ({ params, body }) => (await updateRole(params.id, body)).role,
  audit: {
    action: "role_updated",
    resourceType: "role",
    resourceId: ({ params }) => params.id,
    details: (_ctx, role) => ({ roleName: role.name, permissionsCount: Array.isArray(role.permissions) ? role.permissions.length : 0 }),
  },
});

export const DELETE = defineRoute({
  access: { roles: ["super_admin"] },
  params,
  handler: ({ params }) => deleteRole(params.id),
  audit: { action: "role_deleted", resourceType: "role", resourceId: ({ params }) => params.id, details: (_ctx, role) => ({ roleName: role.name }) },
});
