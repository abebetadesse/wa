import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { BUSINESS_STATUSES, listForVerification } from "@/server/marketplace/businesses";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  query: z.object({ status: z.enum(BUSINESS_STATUSES).default("pending_verification") }),
  handler: ({ query }) => listForVerification(query.status),
});
