import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { fewusTextInput, saveFewusText } from "@/server/intake/responses";

export const PUT = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), headingKey: z.string().min(1).max(60) }),
  body: fewusTextInput,
  handler: ({ user, params, body }) => saveFewusText(user, params.businessId, params.headingKey, body),
  audit: { action: "fewus_text_saved", resourceType: "fewus_text", resourceId: ({ params }) => params.headingKey },
});
