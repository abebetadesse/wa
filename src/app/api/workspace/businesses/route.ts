import { defineRoute } from "@/lib/api/route";
import { businessInput, createBusiness, myBusinesses } from "@/server/marketplace/businesses";

export const GET = defineRoute({ access: "user", handler: ({ user }) => myBusinesses(user) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 5, windowMs: 60 * 60_000 },
  body: businessInput,
  handler: ({ user, body }) => createBusiness(user, body),
  audit: { action: "business_created", resourceType: "business", resourceId: (_ctx, business) => business.id },
});
