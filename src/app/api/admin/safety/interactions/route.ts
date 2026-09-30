import { defineRoute } from "@/lib/api/route";
import { interactionInput, saveInteraction } from "@/server/safety";

/** Creates or replaces the documented interaction for a pair. */
export const POST = defineRoute({
  access: { roles: ["editor", "admin", "super_admin"] } as const,
  body: interactionInput,
  handler: ({ user, body }) => saveInteraction(user, body),
  audit: { action: "safety_interaction_saved", resourceType: "safety_interaction", resourceId: (_ctx, row) => row.id, details: ({ body }) => ({ a: body.a, b: body.b, severity: body.severity }) },
});
