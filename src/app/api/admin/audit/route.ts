import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listAuditEvents } from "@/server/admin/insights";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin", "analyst"] },
  query: z.object({
    action: z.string().trim().optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  }),
  handler: ({ query }) => listAuditEvents(query),
});
