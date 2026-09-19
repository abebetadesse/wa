import { NextRequest, NextResponse } from "next/server";
import { getCase, startSession } from "@/lib/case-workflow/engine";
import { persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  let user;
  try { user = await requireAuthenticatedUser(); } catch { return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }); }
  const body = await request.json().catch(() => ({}));
  const caseId = typeof body.caseId === "string" ? body.caseId : "";
  if (!getCase(caseId)) return NextResponse.json({ success: false, error: "Choose an active case." }, { status: 400 });
  const session = startSession(caseId, user.id);
  await persistCaseSession(session);
  await logAuditEvent({
    userId: user.id,
    action: "case_session_started",
    resourceType: "case_session",
    resourceId: session.id,
    details: { caseId },
    sessionId: session.id,
  });
  return NextResponse.json({ success: true, data: session });
}
