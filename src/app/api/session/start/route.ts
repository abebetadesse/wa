import { NextRequest, NextResponse } from "next/server";
import { getCase, startSession } from "@/lib/case-workflow/engine";
import { persistCaseSession } from "@/lib/case-workflow/repository";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let user;
  try { user = await requireAuthenticatedUser(); } catch { return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }); }
  const body = await request.json().catch(() => ({}));
  const caseId = typeof body.caseId === "string" ? body.caseId : "";
  if (!getCase(caseId)) return NextResponse.json({ success: false, error: "Choose an active case." }, { status: 400 });
  const session = startSession(caseId, user.id);
  await persistCaseSession(session);
  return NextResponse.json({ success: true, data: session });
}
