import { defineRoute } from "@/lib/api/route";
import { getOwnAccount, updateOwnAccount } from "@/server/auth/accounts";
import { ownAccountBody } from "@/server/auth/schemas";

export const GET = defineRoute({
  access: "user",
  handler: ({ user }) => getOwnAccount(user),
});

export const PUT = defineRoute({
  access: "user",
  body: ownAccountBody,
  handler: ({ user, body }) => updateOwnAccount(user, body),
  audit: {
    action: "profile_updated",
    resourceType: "user",
    resourceId: ({ user }) => user.id,
    details: ({ body }) => ({ fieldsUpdated: Object.entries(body).filter(([, value]) => value !== undefined).map(([key]) => key) }),
  },
});
