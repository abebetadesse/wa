import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listManuscriptLibrary } from "@/server/intake/responses";
import { sourceFromSlug } from "@/server/intake/manuscripts";

/** A book's contents and headings with this business's own texts. source: fewus | asmat. */
export const GET = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), source: z.enum(["fewus", "asmat"]) }),
  handler: ({ user, params }) => listManuscriptLibrary(user, params.businessId, sourceFromSlug(params.source)!),
});
