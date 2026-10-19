import { NextResponse } from "next/server";
import { defineRoute } from "@/lib/api/route";
import { getKnowledgeMetadata, invalidateKnowledgeSearchCache } from "@/lib/knowledge/catalog";

/** Clears the knowledge search cache. Administrators only. */
export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  handler: () => {
    invalidateKnowledgeSearchCache();
    return NextResponse.json({
      success: true,
      message: "Reloaded in-memory knowledge catalog and cleared search cache",
      strands: getKnowledgeMetadata(),
    });
  },
});
