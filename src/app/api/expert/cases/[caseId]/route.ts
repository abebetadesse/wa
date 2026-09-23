import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const GET = defineRoute({
  access: { roles: ["expert", "practitioner", "admin", "super_admin"] },
  params: z.object({ caseId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.getForExpert(user, params.caseId),
});
