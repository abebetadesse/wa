import { NextRequest, NextResponse } from "next/server";
import { decideSolutions, restoreSession } from "@/lib/case-workflow/engine";
import { loadCaseSession, persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let user; try { user = await requireAuthenticatedUser(); } catch { return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }); }
  const session = await loadCaseSession(sessionId, user.id);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: { sessionId: session.id, solutions: session.solutions, causes: session.causes.filter((cause) => cause.isSelected), step: session.currentStep } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let user; try { user = await requireAuthenticatedUser(); } catch { return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }); }
  const stored = await loadCaseSession(sessionId, user.id);
  if (!stored) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  restoreSession(stored);
  const body = await request.json().catch(() => ({}));
  const selectedSolutionIds = Array.isArray(body.selectedSolutionIds)
    ? body.selectedSolutionIds.filter((id: unknown): id is string => typeof id === "string")
    : [];
  const session = decideSolutions(sessionId, selectedSolutionIds);
  if (!session) return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
  await persistCaseSession(session);
  return NextResponse.json({ success: true, data: session });
}
