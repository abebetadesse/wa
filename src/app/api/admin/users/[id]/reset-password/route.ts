import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { ADMIN_ROLES } from "@/server/admin/userPolicy";
import { resetUserPassword } from "@/server/admin/users";

export const POST = defineRoute({
  access: { roles: ADMIN_ROLES },
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ temporaryPassword: z.string().trim().min(1).optional() }),
  handler: ({ user, params, body }) => resetUserPassword(user, params.id, body.temporaryPassword),
  audit: {
    action: "admin_password_reset",
    resourceType: "user",
    resourceId: ({ params }) => params.id,
    details: (_ctx, result) => ({ targetEmail: result.email }),
  },
});
