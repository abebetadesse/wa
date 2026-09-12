import { NextRequest, NextResponse } from "next/server";
import { getCase, getQuestions } from "@/lib/case-workflow/engine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    await requireAuthenticatedUser();
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication required. Please sign in or register." },
      { status: 401 }
    );
  }
  const { caseId } = await params;
  const selectedCase = getCase(caseId);
  if (!selectedCase) return NextResponse.json({ success: false, error: "Case not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: { case: selectedCase, questions: getQuestions(selectedCase.commonQuestionSetId) } });
}
