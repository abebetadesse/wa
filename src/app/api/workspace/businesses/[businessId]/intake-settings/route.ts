import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listIntakeSettings } from "@/server/intake/settings";

export const GET = defineRoute({ access: "user", params: z.object({ businessId: z.string().uuid() }), handler: ({ user, params }) => listIntakeSettings(user, params.businessId) });
