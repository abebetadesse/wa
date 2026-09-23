import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  importCsv,
  KNOWLEDGE_EDITORS,
} from "@/server/knowledge/admin";

export const POST = defineRoute({
  access: { roles: KNOWLEDGE_EDITORS },
  status: 201,
  body: z.object({
    categoryId: z.string().min(1, "categoryId and file are required."),
    file: z
      .instanceof(File, { message: "categoryId and file are required." })
      .refine((file) => file.name.toLowerCase().endsWith(".csv") || !file.type || file.type === "text/csv", "Only CSV files are accepted."),
  }),
  handler: async ({ user, body }) => importCsv(user, body.categoryId, await body.file.text()),
  audit: {
    action: "knowledge_items_imported",
    resourceType: "knowledge_category",
    resourceId: ({ body }) => body.categoryId,
    details: (_ctx, result) => ({ format: "csv", imported: result.imported }),
  },
});
