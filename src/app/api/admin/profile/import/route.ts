import { defineRoute } from "@/lib/api/route";
import { fieldImport, importFields } from "@/server/profile/fieldAdmin";

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  status: 201,
  body: fieldImport,
  handler: ({ user, body }) => importFields(user, body),
  audit: { action: "profile_fields_imported", resourceType: "profile_field", details: (_ctx, result) => ({ imported: result.imported }) },
});
