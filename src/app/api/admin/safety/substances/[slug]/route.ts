import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { substanceInput, updateSubstance } from "@/server/safety";

export const PUT = defineRoute({
  access: { roles: ["editor", "admin", "super_admin"] } as const,
  params: z.object({ slug: z.string().min(1).max(100) }),
  body: substanceInput,
  handler: ({ user, params, body }) => updateSubstance(user, params.slug, body),
  audit: { action: "safety_substance_updated", resourceType: "safety_substance", resourceId: ({ params }) => params.slug },
});
