import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { ADMIN_ROLES, USER_STATUSES } from "@/server/admin/userPolicy";
import { setUserStatus } from "@/server/admin/users";

export const PATCH = defineRoute({
  access: { roles: ADMIN_ROLES },
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(USER_STATUSES, { message: "Status must be 'active', 'inactive', or 'suspended'." }),
    reason: z.string().trim().optional(),
  }),
  handler: ({ user, params, body }) => setUserStatus(user, params.id, body.status, body.reason),
  audit: {
    action: ({ body }) => `user_status_${body.status}`,
    resourceType: "user",
    resourceId: ({ params }) => params.id,
    details: ({ body }, updated) => ({ status: body.status, reason: body.reason ?? null, targetEmail: updated.email }),
  },
});
