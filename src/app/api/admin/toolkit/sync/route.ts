import { defineRoute } from "@/lib/api/route";
import { ensureToolsSynced, listAllTools } from "@/server/toolkit";

/** Pulls newly added engines and pathways from the code into the toolkit now. */
export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] } as const,
  handler: async () => {
    await ensureToolsSynced(true);
    return listAllTools();
  },
  audit: { action: "toolkit_synced", resourceType: "toolkit_tool" },
});
