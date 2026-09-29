import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { revokeInvitation } from "@/server/marketplace/team";

export const DELETE = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), invitationId: z.string().uuid() }),
  handler: ({ user, params }) => revokeInvitation(user, params.businessId, params.invitationId),
  audit: { action: "team_invitation_revoked", resourceType: "business_invitation", resourceId: ({ params }) => params.invitationId },
});
