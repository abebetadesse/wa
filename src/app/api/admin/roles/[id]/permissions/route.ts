import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { permissionList, updateRole } from "@/server/admin/roles";

export const PATCH = defineRoute({
  access: { roles: ["super_admin"] },
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ permissions: permissionList }),
  handler: async ({ params, body }) => {
    const { previous, role } = await updateRole(params.id, { permissions: body.permissions });
    const before = new Set((previous.permissions as string[] | null) ?? []);
    const after = new Set(body.permissions);
    return {
      ...role,
      added: [...after].filter((key) => !before.has(key)),
      removed: [...before].filter((key) => !after.has(key)),
      message: `Permissions updated for role '${role.name}'.`,
    };
  },
  audit: {
    action: "role_permissions_updated",
    resourceType: "role",
    resourceId: ({ params }) => params.id,
    details: (_ctx, result) => ({ roleName: result.name, added: result.added, removed: result.removed }),
  },
});
