import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getTeam, inviteInput, inviteMember } from "@/server/marketplace/team";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => getTeam(user, params.businessId),
});

/** Links use APP_URL when configured, so a spoofed Host header cannot change them. */
export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 30, windowMs: 60 * 60_000 },
  params,
  body: inviteInput,
  handler: ({ req, user, params, body }) => inviteMember(user, params.businessId, body, process.env.APP_URL?.replace(/\/$/, "") || req.nextUrl.origin),
  audit: {
    action: "team_member_invited",
    resourceType: "business",
    resourceId: ({ params }) => params.businessId,
    details: ({ body }) => ({ email: body.email, role: body.role }),
  },
});
