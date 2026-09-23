import { defineRoute } from "@/lib/api/route";
import { fileResponse } from "@/lib/api/upload";
import { exportAll, KNOWLEDGE_ADMINS } from "@/server/knowledge/admin";

export const GET = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  handler: async () =>
    fileResponse(JSON.stringify(await exportAll(), null, 2), { type: "application/json", filename: "knowledge-backup.json" }),
  audit: { action: "knowledge_exported", resourceType: "knowledge_item", details: () => ({ format: "json" }) },
});
