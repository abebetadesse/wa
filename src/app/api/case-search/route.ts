import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { searchCaseSamples } from "@/lib/discovery/caseSearch";
import { getSettings } from "@/server/settings";

const querySchema = z.object({
  q: z.string().trim().max(200).optional(),
  caseType: z.string().trim().max(100).optional(),
  herb: z.string().trim().max(100).optional(),
  diet: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  element: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const GET = defineRoute({
  access: "public",
  query: querySchema,
  handler: async ({ query }) => {
    const settings = await getSettings("caseSearch");
    return searchCaseSamples({ ...query, query: query.q }, settings);
  },
});
