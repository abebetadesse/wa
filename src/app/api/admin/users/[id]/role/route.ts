import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { changeUserRole } from "@/server/admin/users";

export const PATCH = defineRoute({
  access: { roles: ["super_admin"] },
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ role: z.string().trim().min(1, "Role name is required.") }),
  handler: async ({ user, params, body }) => {
    const { user: updated, previousRole } = await changeUserRole(user, params.id, body.role);
    return { ...updated, previousRole, message: `User role updated to ${body.role}.` };
  },
  audit: {
    action: "user_role_changed",
    resourceType: "user",
    resourceId: ({ params }) => params.id,
    details: ({ body }, result) => ({ previousRole: result.previousRole, newRole: body.role, targetEmail: result.email }),
  },
});
