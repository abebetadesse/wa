import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { fileResponse } from "@/lib/api/upload";
import { exportItemsCsv, KNOWLEDGE_READERS } from "@/server/knowledge/admin";

export const GET = defineRoute({
  access: { roles: KNOWLEDGE_READERS },
  query: z.object({ categoryId: z.string().optional() }),
  handler: async ({ query }) =>
    fileResponse(await exportItemsCsv(query.categoryId), {
      type: "text/csv; charset=utf-8",
      filename: `${query.categoryId ? `knowledge-${query.categoryId}` : "knowledge-backup"}.csv`,
    }),
  audit: { action: "knowledge_exported", resourceType: "knowledge_item", details: ({ query }) => ({ format: "csv", categoryId: query.categoryId ?? null }) },
});
