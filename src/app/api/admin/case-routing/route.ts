import { defineRoute } from "@/lib/api/route";
import { caseRoutingSettings } from "@/server/settings";
import { caseRoutingDesk, saveCaseRouting } from "@/server/cases/routing";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  handler: () => caseRoutingDesk(),
});

export const PUT = defineRoute({
  access: { roles: ["super_admin"] },
  body: caseRoutingSettings,
  handler: ({ user, body }) => saveCaseRouting(body, user.id),
  audit: {
    action: "case_routing_updated",
    resourceType: "platform_settings",
    resourceId: () => "caseRouting",
    details: ({ body }) => ({ domains: body.domains }),
  },
});
