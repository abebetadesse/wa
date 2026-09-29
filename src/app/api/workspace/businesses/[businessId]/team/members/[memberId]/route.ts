import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { memberUpdate, removeMember, updateMember } from "@/server/marketplace/team";

const params = z.object({ businessId: z.string().uuid(), memberId: z.string().uuid() });

export const PATCH = defineRoute({
  access: "user",
  params,
  body: memberUpdate,
  handler: ({ user, params, body }) => updateMember(user, params.businessId, params.memberId, body),
  audit: { action: "team_member_updated", resourceType: "business_member", resourceId: ({ params }) => params.memberId, details: ({ body }) => ({ ...body }) },
});

export const DELETE = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => removeMember(user, params.businessId, params.memberId),
  audit: {
    action: (_ctx, result) => (result.left ? "team_member_left" : "team_member_removed"),
    resourceType: "business_member",
    resourceId: ({ params }) => params.memberId,
    details: ({ params }) => ({ businessId: params.businessId }),
  },
});
