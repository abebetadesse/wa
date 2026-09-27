import { NextRequest, NextResponse } from "next/server";
import { processSession, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, loadGuestCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
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
  const session = processSession(sessionId);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  return NextResponse.json({ success: true, data: session });
}
