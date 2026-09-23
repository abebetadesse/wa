import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { archiveField, fieldInput, updateField } from "@/server/profile/fieldAdmin";

const params = z.object({ id: z.string().min(1) });

export const PUT = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params,
  body: fieldInput,
  handler: ({ user, params, body }) => updateField(user, params.id, body),
  audit: { action: "profile_field_updated", resourceType: "profile_field", resourceId: ({ params }) => params.id },
});

export const DELETE = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params,
  handler: ({ user, params }) => archiveField(user, params.id),
  audit: { action: "profile_field_archived", resourceType: "profile_field", resourceId: ({ params }) => params.id },
});
