import { NextRequest, NextResponse } from "next/server";
import { confirmReport, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let user; try { user = await requireAuthenticatedUser(); } catch { return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }); }
  const stored = await loadCaseSession(sessionId, user.id);
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const body = await request.json().catch(() => ({}));
  const session = confirmReport(sessionId, body.confirmed !== false);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  return NextResponse.json({ success: true, data: session });
}
