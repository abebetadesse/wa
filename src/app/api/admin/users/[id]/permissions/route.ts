import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { ADMIN_ROLES } from "@/server/admin/userPolicy";
import { getUserPermissionSet } from "@/server/admin/users";

export const GET = defineRoute({
  access: { roles: ADMIN_ROLES },
  params: z.object({ id: z.string().min(1) }),
  handler: ({ params }) => getUserPermissionSet(params.id),
});
