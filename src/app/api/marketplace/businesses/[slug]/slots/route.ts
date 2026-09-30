import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { availableSlots, slotQuery } from "@/server/marketplace/catalogue";
import { resolvePublicBusinessId } from "@/server/marketplace/businesses";

export const GET = defineRoute({
  access: "public",
  params: z.object({ slug: z.string().min(1).max(120) }),
  query: slotQuery,
  handler: async ({ params, query, user }) => availableSlots(await resolvePublicBusinessId(params.slug, user), query),
});
