import { NextRequest, NextResponse } from "next/server";
import { bookExpertConsultation, getSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await req.json();
    const { expertId, slot, format = "video" } = body;

    const session = bookExpertConsultation(caseId, expertId, slot, format);

    return NextResponse.json({
      success: true,
      data: {
        caseId: session.id,
        status: session.status,
        consultation: session.report?.consultation,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to book consultation" },
      { status: 400 }
    );
  }
}
