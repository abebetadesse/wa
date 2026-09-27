import { NextRequest, NextResponse } from "next/server";
import { decideSolutions, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, loadGuestCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let session;
  try {
    const user = await requireAuthenticatedUser();
    session = await loadCaseSession(sessionId, user.id);
  } catch {
    session = await loadGuestCaseSession(sessionId);
  }
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: { sessionId: session.id, solutions: session.solutions, causes: session.causes.filter((cause) => cause.isSelected), step: session.currentStep } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let user = null;
  let stored;
  try {
    user = await requireAuthenticatedUser();
    stored = await loadCaseSession(sessionId, user.id);
  } catch {
    stored = await loadGuestCaseSession(sessionId);
  }
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const body = await request.json().catch(() => ({}));
  const selectedSolutionIds = Array.isArray(body.selectedSolutionIds)
    ? body.selectedSolutionIds.filter((id: unknown): id is string => typeof id === "string")
    : [];
  const session = decideSolutions(sessionId, selectedSolutionIds);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  if (user) {
    await logAuditEvent({
      userId: user.id,
      action: "case_solutions_accepted",
      resourceType: "case_session",
      resourceId: session.id,
      details: { caseId: session.caseId, selectedSolutionIds },
      sessionId: session.id,
    });
  }
  return NextResponse.json({ success: true, data: session });
}
