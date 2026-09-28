import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listBusinessReviews } from "@/server/marketplace/engagement";

export const GET = defineRoute({ access: "user", params: z.object({ businessId: z.string().uuid() }), handler: ({ user, params }) => listBusinessReviews(user, params.businessId) });
