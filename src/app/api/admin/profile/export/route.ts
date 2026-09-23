import { defineRoute } from "@/lib/api/route";
import { fileResponse } from "@/lib/api/upload";
import { exportFields } from "@/server/profile/fieldAdmin";

export const GET = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  handler: async () =>
    fileResponse(JSON.stringify(await exportFields(), null, 2), { type: "application/json", filename: "profile-fields.json" }),
});
