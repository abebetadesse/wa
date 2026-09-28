import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { requireCapability } from "@/server/marketplace/access";
import { searchHerbs } from "@/server/marketplace/engagement";

export const GET = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid() }),
  query: z.object({ q: z.string().trim().min(1).max(80) }),
  handler: async ({ user, params, query }) => {
    await requireCapability(user, params.businessId, "manageInventory");
    return searchHerbs(query.q);
  },
});
