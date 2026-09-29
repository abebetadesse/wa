import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { acceptInvitation, previewInvitation } from "@/server/marketplace/team";

const params = z.object({ token: z.string().min(20).max(100) });

export const GET = defineRoute({
  access: "user",
  rateLimit: { limit: 60, windowMs: 15 * 60_000 },
  params,
  handler: ({ user, params }) => previewInvitation(user, params.token),
});

export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 20, windowMs: 15 * 60_000 },
  params,
  handler: ({ user, params }) => acceptInvitation(user, params.token),
  audit: { action: "team_invitation_accepted", resourceType: "business", resourceId: (_ctx, result) => result.businessId },
});
