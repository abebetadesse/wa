import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { requireCapability } from "@/server/marketplace/access";
import { listPractitioners } from "@/server/marketplace/bookings";

export const GET = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid() }),
  handler: async ({ user, params }) => {
    await requireCapability(user, params.businessId, "view");
    return listPractitioners(params.businessId);
  },
});
