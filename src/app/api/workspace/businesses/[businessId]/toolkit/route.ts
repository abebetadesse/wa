import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getBusinessToolkit } from "@/server/toolkit";

export const GET = defineRoute({ access: "user", params: z.object({ businessId: z.string().uuid() }), handler: ({ user, params }) => getBusinessToolkit(user, params.businessId) });
