import { defineRoute } from "@/lib/api/route";
import { createField, fieldInput, listFields } from "@/server/profile/fieldAdmin";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  handler: () => listFields(),
});

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  status: 201,
  body: fieldInput,
  handler: ({ user, body }) => createField(user, body),
  audit: { action: "profile_field_created", resourceType: "profile_field", resourceId: (_ctx, field) => field?.id },
});
