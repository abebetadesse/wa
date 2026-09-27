import { NextRequest, NextResponse } from "next/server";
import { getNextQuestions, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, loadGuestCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let stored;
  try {
    const user = await requireAuthenticatedUser();
    stored = await loadCaseSession(sessionId, user.id);
  } catch {
    // Guest path: session was created without authentication
    stored = await loadGuestCaseSession(sessionId);
  }
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const next = getNextQuestions(sessionId);
  if (!next) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: next });
}
