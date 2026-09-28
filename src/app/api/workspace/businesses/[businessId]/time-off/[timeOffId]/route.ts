import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { removeTimeOff } from "@/server/marketplace/catalogue";

export const DELETE = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), timeOffId: z.string().uuid() }),
  handler: ({ user, params }) => removeTimeOff(user, params.businessId, params.timeOffId),
});
