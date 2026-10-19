import { NextResponse } from "next/server";
import { defineRoute } from "@/lib/api/route";
import { storeKnowledgeDocument } from "@/lib/knowledge/catalog";
import { knowledgeDocumentFromCsv } from "@/lib/knowledge/csv";

/** Replaces one strand of the in-memory knowledge catalogue (JSON or CSV upload). Administrators only. */
export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  handler: async ({ req }) => {
    try {
      if (req.headers.get("content-type")?.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
          return NextResponse.json({ success: false, error: 'Multipart request must include a "file" field' }, { status: 400 });
        }
        const document = storeKnowledgeDocument(knowledgeDocumentFromCsv(await file.text()));
        return NextResponse.json({
          success: true,
          message: `Successfully loaded ${document.strand} CSV strand`,
          strand: document.strand,
          categories: document.categories.length,
          items: document.categories.reduce((sum, category) => sum + category.data.length, 0),
        });
      }

      const body = await req.json();
      if (body?.filePath) {
        return NextResponse.json(
          { success: false, error: "filePath uploads are not supported by this API" },
          { status: 400 }
        );
      }

      const document = storeKnowledgeDocument(body?.data || body);
      return NextResponse.json({
        success: true,
        message: `Successfully loaded ${document.strand} strand`,
        strand: document.strand,
        categories: document.categories.length,
        data: document,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "Invalid knowledge document" },
        { status: 400 }
      );
    }
  },
});
