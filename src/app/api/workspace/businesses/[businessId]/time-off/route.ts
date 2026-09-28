import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { addTimeOff, timeOffInput } from "@/server/marketplace/catalogue";

export const POST = defineRoute({
  access: "user",
  status: 201,
  params: z.object({ businessId: z.string().uuid() }),
  body: timeOffInput,
  handler: ({ user, params, body }) => addTimeOff(user, params.businessId, body),
});
