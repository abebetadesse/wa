import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { setBusinessTool, toolChoiceInput } from "@/server/toolkit";

export const PUT = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), key: z.string().min(1).max(80) }),
  body: toolChoiceInput,
  handler: ({ user, params, body }) => setBusinessTool(user, params.businessId, params.key, body),
});
