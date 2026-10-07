import { defineRoute } from "@/lib/api/route";
import { caseSearchSettings, getSettings, updateSettings } from "@/server/settings";

const admins = { roles: ["admin", "super_admin"] } as const;

export const GET = defineRoute({
  access: admins,
  handler: () => getSettings("caseSearch"),
});

export const PUT = defineRoute({
  access: admins,
  body: caseSearchSettings,
  handler: ({ body, user }) => updateSettings("caseSearch", body, user.id),
  audit: {
    action: "case_search_filters_updated",
    resourceType: "platform_settings",
    resourceId: () => "caseSearch",
    details: ({ body }) => ({ enabledFilters: Object.entries(body).filter(([, enabled]) => enabled).map(([field]) => field) }),
  },
});
