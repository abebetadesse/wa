import { NextRequest, NextResponse } from "next/server";
import { confirmReport, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, loadGuestCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let user;
  let stored;
  try {
    user = await requireAuthenticatedUser();
    stored = await loadCaseSession(sessionId, user.id);
  } catch {
    stored = await loadGuestCaseSession(sessionId);
    user = null;
  }
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const body = await request.json().catch(() => ({}));
  const confirmed = body.confirmed !== false;
  const session = confirmReport(sessionId, confirmed);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  if (user) {
    await logAuditEvent({
      userId: user.id,
      action: confirmed ? "case_report_confirmed" : "case_report_rejected",
      resourceType: "case_session",
      resourceId: session.id,
      details: { caseId: session.caseId, currentStep: session.currentStep },
      sessionId: session.id,
    });
  }
  return NextResponse.json({ success: true, data: session });
}
