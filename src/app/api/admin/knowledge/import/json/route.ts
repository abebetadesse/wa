import { defineRoute } from "@/lib/api/route";
import { readJsonUpload } from "@/lib/api/upload";
import { importItemRows, importItems, KNOWLEDGE_ADMINS } from "@/server/knowledge/admin";

export const POST = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  status: 201,
  handler: async ({ req, user }) => importItemRows(user, importItems.parse(await readJsonUpload(req))),
  audit: {
    action: "knowledge_items_imported",
    resourceType: "knowledge_item",
    details: (_ctx, result) => ({ format: "json", imported: result.imported }),
  },
});
