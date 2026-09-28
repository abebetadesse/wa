import { defineRoute } from "@/lib/api/route";
import { categoryInput, listCategories, upsertCategory } from "@/server/marketplace/catalogue";

export const GET = defineRoute({ access: { roles: ["admin", "super_admin"] }, handler: () => listCategories(true) });

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  status: 201,
  body: categoryInput,
  handler: ({ body }) => upsertCategory(null, body),
  audit: { action: "business_category_created", resourceType: "business_category", resourceId: (_ctx, row) => row.id },
});
