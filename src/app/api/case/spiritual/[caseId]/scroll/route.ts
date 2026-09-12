import { NextRequest, NextResponse } from "next/server";
import { getSpiritualCase, generateHealingScroll } from "@/lib/case-workflow/spiritualExpertEngine";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const session = getSpiritualCase(caseId);

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const scroll = session.report?.healingScroll || generateHealingScroll(session.gematria, session.category);

    return NextResponse.json({
      success: true,
      data: scroll,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch scroll" },
      { status: 500 }
    );
  }
}
