import { NextRequest, NextResponse } from "next/server";
import { getSession, restoreSession, saveAnswers } from "@/lib/case-workflow/engine";
import { loadCaseSession, loadGuestCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let stored;
  try {
    const user = await requireAuthenticatedUser();
    stored = await loadCaseSession(sessionId, user.id);
  } catch {
    stored = await loadGuestCaseSession(sessionId);
  }
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const body = await request.json().catch(() => ({}));
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const session = saveAnswers(sessionId, answers);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  return NextResponse.json({ success: true, data: session });
}

export const POST = PUT;
