import { defineRoute } from "@/lib/api/route";
import { getSystemStatus, runSystemAction, systemAction } from "@/server/admin/system";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin", "analyst"] },
  handler: () => getSystemStatus(),
});

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  body: systemAction,
  handler: async ({ user, body }) => {
    const { message, config, audit } = await runSystemAction(user, body);
    return { message, config, audit };
  },
  audit: {
    action: (_ctx, result) => result.audit.action,
    resourceType: "system_control",
    details: (_ctx, result) => ({ ...result.audit.details, resource: result.audit.resourceType }),
  },
});
