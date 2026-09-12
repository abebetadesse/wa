import { NextResponse } from "next/server";
import { requireAuthenticatedUser, revokeAllSessions } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";

export async function DELETE() {
  try {
    const user = await requireAuthenticatedUser();
    await revokeAllSessions(user.id);

    await logAuditEvent({
      userId: user.id,
      action: "all_sessions_revoked",
      resourceType: "session",
      resourceId: user.id,
    });

    await logUserActivity({
      userId: user.id,
      activityType: "security",
      description: "Revoked all active sessions",
    });

    return NextResponse.json({ success: true, message: "All sessions revoked successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error && error.message === "AUTH_REQUIRED" ? "Authentication required." : "Failed to revoke sessions." },
      { status: error instanceof Error && error.message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
