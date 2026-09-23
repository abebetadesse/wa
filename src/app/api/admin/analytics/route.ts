import { defineRoute } from "@/lib/api/route";
import { getAnalytics } from "@/server/admin/insights";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin", "analyst"] },
  handler: () => getAnalytics(),
});
