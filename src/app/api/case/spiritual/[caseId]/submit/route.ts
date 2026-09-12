import { NextRequest, NextResponse } from "next/server";
import { submitSpiritualCase, getSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await req.json();
    const answers = body.answers || body;

    const session = await submitSpiritualCase(caseId, answers);

    return NextResponse.json({
      success: true,
      urgencyLevel: session.crisisScreen.urgencyLevel,
      crisisContent: session.crisisScreen.crisisContent,
      paywall: session.crisisScreen.paywall,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit case" },
      { status: 400 }
    );
  }
}
