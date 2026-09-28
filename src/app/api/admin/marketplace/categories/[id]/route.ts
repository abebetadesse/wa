import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { categoryInput, upsertCategory } from "@/server/marketplace/catalogue";

export const PUT = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ id: z.string().uuid() }),
  body: categoryInput,
  handler: ({ params, body }) => upsertCategory(params.id, body),
  audit: { action: "business_category_updated", resourceType: "business_category", resourceId: ({ params }) => params.id },
});
