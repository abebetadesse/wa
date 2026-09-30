import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listFewusLibrary } from "@/server/intake/responses";

export const GET = defineRoute({ access: "user", params: z.object({ businessId: z.string().uuid() }), handler: ({ user, params }) => listFewusLibrary(user, params.businessId) });
