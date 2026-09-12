import { NextRequest, NextResponse } from "next/server";
import { getNextQuestions, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let user; try { user = await requireAuthenticatedUser(); } catch { return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }); }
  const stored = await loadCaseSession(sessionId, user.id);
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const next = getNextQuestions(sessionId);
  if (!next) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: next });
}
