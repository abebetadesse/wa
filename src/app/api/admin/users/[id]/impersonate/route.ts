import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { impersonateUser } from "@/lib/auth";
import { getAdminUser, recordImpersonation } from "@/server/admin/users";

export const POST = defineRoute({
  access: { roles: ["super_admin"] },
  params: z.object({ id: z.string().min(1) }),
  handler: async ({ user, params }) => {
    const target = await getAdminUser(params.id);
    await impersonateUser(target.id);
    await recordImpersonation(user.id, target);
    return {
      id: target.id,
      email: target.email,
      name: target.name,
      role: target.role,
      message: `Now impersonating ${target.name || target.email}.`,
    };
  },
});
