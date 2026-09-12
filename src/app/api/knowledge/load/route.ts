import { NextRequest, NextResponse } from "next/server";
import { storeKnowledgeDocument } from "@/lib/knowledge/catalog";
import { knowledgeDocumentFromCsv } from "@/lib/knowledge/csv";

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData();
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

    const body = await request.json();
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
}