import { NextResponse } from "next/server";
import { ETHIOPIAN_MANUSCRIPT_SOURCES } from "@/lib/cultural/manuscriptSources";

export function GET() {
  return NextResponse.json({
    success: true,
    sources: ETHIOPIAN_MANUSCRIPT_SOURCES,
    disclaimer:
      "These user-supplied manuscripts are cultural and historical references. They are not clinical evidence, medical instructions, or a substitute for qualified care. Full text remains source-controlled and requires cultural and rights review before publication.",
  });
}
