import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { searchSuggestions } from "@/server/marketplace/businesses";

export const GET = defineRoute({
  access: "public",
  query: z.object({
    q: z.string().default(""),
  }),
  handler: ({ query, user }) => searchSuggestions(query.q, user),
});
