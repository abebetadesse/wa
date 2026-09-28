import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { dashboard } from "@/server/marketplace/operations";

export const GET = defineRoute({ access: "user", params: z.object({ businessId: z.string().uuid() }), handler: ({ user, params }) => dashboard(user, params.businessId) });
