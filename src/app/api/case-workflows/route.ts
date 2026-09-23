import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

/** Available case types and the signed-in user's cases. */
export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => ({ domains: caseService.listDomains(), cases: await caseService.listMine(user) }),
});
