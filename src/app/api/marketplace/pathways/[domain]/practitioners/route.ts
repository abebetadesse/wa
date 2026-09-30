import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { practitionersForPathway } from "@/server/marketplace/businesses";

/** Verified healers who offer a service linked to this care pathway. */
export const GET = defineRoute({
  access: "public",
  params: z.object({ domain: z.string().min(1).max(30) }),
  handler: ({ params, user }) => practitionersForPathway(params.domain, user),
});
