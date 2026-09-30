import { defineRoute } from "@/lib/api/route";
import { createSubstance, substanceInput } from "@/server/safety";

export const POST = defineRoute({
  access: { roles: ["editor", "admin", "super_admin"] } as const,
  status: 201,
  body: substanceInput,
  handler: ({ user, body }) => createSubstance(user, body),
  audit: { action: "safety_substance_created", resourceType: "safety_substance", resourceId: (_ctx, row) => row.slug },
});
