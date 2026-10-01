import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api/route";
import { manuscriptTextInput, saveManuscriptText } from "@/server/intake/responses";
import { sourceForHeadingKey, sourceFromSlug } from "@/server/intake/manuscripts";

export const PUT = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), source: z.enum(["fewus", "asmat"]), headingKey: z.string().min(1).max(60) }),
  body: manuscriptTextInput,
  handler: ({ user, params, body }) => {
    if (sourceForHeadingKey(params.headingKey) !== sourceFromSlug(params.source)) throw ApiError.notFound("Heading");
    return saveManuscriptText(user, params.businessId, params.headingKey, body);
  },
  audit: { action: "manuscript_text_saved", resourceType: "manuscript_text", resourceId: ({ params }) => params.headingKey },
});
