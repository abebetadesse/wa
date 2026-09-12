import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser, revokeSession } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id: sessionId } = await params;

    await revokeSession(sessionId, user.id);

    await logAuditEvent({
      userId: user.id,
      action: "session_revoked",
      resourceType: "session",
      resourceId: sessionId,
    });

    await logUserActivity({
      userId: user.id,
      activityType: "security",
      description: "Revoked active session",
      metadata: { sessionId },
    });

    return NextResponse.json({ success: true, message: "Session revoked successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error && error.message === "AUTH_REQUIRED" ? "Authentication required." : "Failed to revoke session." },
      { status: error instanceof Error && error.message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
