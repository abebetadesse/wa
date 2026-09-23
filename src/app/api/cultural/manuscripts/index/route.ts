import { NextRequest, NextResponse } from "next/server";
import { getManuscriptIndex } from "@/lib/cultural/manuscriptIndex";

export function GET(request: NextRequest) {
  const sourceId = request.nextUrl.searchParams.get("sourceId") || undefined;
  return NextResponse.json({
    success: true,
    entries: getManuscriptIndex(sourceId),
    disclaimer:
      "Indexed entries are OCR-derived cultural navigation summaries awaiting cultural review. They are not Debral evidence or actionable treatment instructions.",
  });
}
