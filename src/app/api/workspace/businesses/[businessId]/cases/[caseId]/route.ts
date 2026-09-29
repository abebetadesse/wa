import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
const params = z.object({ businessId: z.string().uuid(), caseId: z.string().uuid() });

export const GET = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => caseService.getForExpert(user, params.caseId),
});
