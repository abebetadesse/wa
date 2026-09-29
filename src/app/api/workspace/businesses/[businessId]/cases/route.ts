import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

/** Cases opened from this business's bookings. Reviewers only (owner, manager, practitioner). */
export const GET = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid() }),
  handler: ({ user, params }) => caseService.businessQueue(user, params.businessId),
});
