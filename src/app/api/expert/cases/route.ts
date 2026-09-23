import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const GET = defineRoute({
  access: { roles: ["expert", "practitioner", "admin", "super_admin"] },
  handler: ({ user }) => caseService.queue(user),
});
