import { defineRoute } from "@/lib/api/route";
import { adminReference, ensureSafetySynced } from "@/server/safety";

/** Pulls new starter entries from the code; entries edited by the knowledge team are kept. */
export const POST = defineRoute({
  access: { roles: ["editor", "admin", "super_admin"] } as const,
  handler: async () => {
    await ensureSafetySynced(true);
    return adminReference();
  },
  audit: { action: "safety_reference_synced", resourceType: "safety_substance" },
});
