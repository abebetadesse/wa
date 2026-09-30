import { defineRoute } from "@/lib/api/route";
import { adminPaymentQuery, listPlatformPayments } from "@/server/payments";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  query: adminPaymentQuery,
  handler: ({ query }) => listPlatformPayments(query),
});
