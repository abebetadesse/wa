import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { deleteInteraction } from "@/server/safety";

export const DELETE = defineRoute({
  access: { roles: ["editor", "admin", "super_admin"] } as const,
  params: z.object({ id: z.string().uuid() }),
  handler: ({ user, params }) => deleteInteraction(user, params.id),
  audit: { action: "safety_interaction_removed", resourceType: "safety_interaction", resourceId: ({ params }) => params.id },
});
