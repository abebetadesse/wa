import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

/** Available case types (public, so pathway pages work for visitors) and, when signed in, the user's cases. */
export const GET = defineRoute({
  access: "public",
  handler: async ({ user }) => ({ domains: caseService.listDomains(), cases: user ? await caseService.listMine(user) : [] }),
});
