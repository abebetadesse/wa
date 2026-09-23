import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listRoleMembers } from "@/server/admin/roles";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ id: z.string().min(1) }),
  handler: ({ params }) => listRoleMembers(params.id),
});
