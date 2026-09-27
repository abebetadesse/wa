import { NextRequest, NextResponse } from "next/server";
import { refineCauses, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, loadGuestCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

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
  const selectedCauseIds = Array.isArray(body.selectedCauseIds) ? body.selectedCauseIds.filter((id: unknown): id is string => typeof id === "string") : [];
  const session = refineCauses(sessionId, selectedCauseIds);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  if (user) {
    await logAuditEvent({
      userId: user.id,
      action: "case_causes_refined",
      resourceType: "case_session",
      resourceId: session.id,
      details: { caseId: session.caseId, selectedCauseIds },
      sessionId: session.id,
    });
  }
  return NextResponse.json({ success: true, data: session });
}
