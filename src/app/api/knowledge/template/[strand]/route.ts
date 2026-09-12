import { NextResponse } from "next/server";
import { createKnowledgeCsvTemplate } from "@/lib/knowledge/csv";
import { isKnowledgeStrand } from "@/lib/knowledge/catalog";

interface RouteParams {
  params: Promise<{ strand: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { strand } = await params;
  if (!isKnowledgeStrand(strand)) {
    return NextResponse.json({ success: false, error: `Unknown knowledge strand: ${strand}` }, { status: 404 });
  }

  return new NextResponse(createKnowledgeCsvTemplate(strand), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${strand}_strand_template.csv"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}