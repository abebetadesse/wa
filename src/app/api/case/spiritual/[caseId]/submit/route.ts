import { NextRequest, NextResponse } from "next/server";
import { submitSpiritualCase, getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { caseId } = await params;
    const body = await req.json();
    const answers = body.answers || body;
    const session = getOwnedSpiritualCase(caseId, user.id);
    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found." }, { status: 404 });
    }

    const updatedSession = await submitSpiritualCase(caseId, answers);

    return NextResponse.json({
      success: true,
      urgencyLevel: updatedSession.crisisScreen.urgencyLevel,
      crisisContent: updatedSession.crisisScreen.crisisContent,
      paywall: updatedSession.crisisScreen.paywall,
      data: updatedSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit case" },
      { status: 400 }
    );
  }
}
