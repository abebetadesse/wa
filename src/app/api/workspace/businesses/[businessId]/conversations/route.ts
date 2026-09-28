import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listConversations } from "@/server/marketplace/engagement";

export const GET = defineRoute({ access: "user", params: z.object({ businessId: z.string().uuid() }), handler: ({ user, params }) => listConversations(user, params.businessId) });
