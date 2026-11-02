import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { addMemberDirectly, directMemberInput } from "@/server/marketplace/team";

const params = z.object({ businessId: z.string().uuid() });

/** Adds a team member directly, with an email and a first password. Nobody is emailed. */
export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 30, windowMs: 60 * 60_000 },
  params,
  body: directMemberInput,
  handler: ({ user, params, body }) => addMemberDirectly(user, params.businessId, body),
  audit: {
    action: "team_member_added",
    resourceType: "business",
    resourceId: ({ params }) => params.businessId,
    details: ({ body }) => ({ email: body.email, role: body.role }),
  },
});
