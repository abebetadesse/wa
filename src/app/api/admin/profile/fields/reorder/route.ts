import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { reorderFields } from "@/server/profile/fieldAdmin";

export const PUT = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  body: z.object({ ids: z.array(z.string().min(1), { message: "ids must be an array of strings." }) }),
  handler: ({ user, body }) => reorderFields(user, body.ids),
  audit: { action: "profile_fields_reordered", resourceType: "profile_field" },
});
