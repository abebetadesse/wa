import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { impersonateUser } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target user not found." }, { status: 404 });
    }

    const result = await impersonateUser(targetUserId);

    await logAuditEvent({
      userId: result.originalUserId,
      action: "user_impersonated",
      resourceType: "user",
      resourceId: targetUserId,
      details: { targetEmail: targetUser.email, targetRole: targetUser.role },
    });

    await logUserActivity({
      userId: targetUserId,
      activityType: "impersonation",
      description: `Session impersonated by Super Admin (${result.originalUserId})`,
    });

    return NextResponse.json({
      success: true,
      message: `Now impersonating ${targetUser.name || targetUser.email}.`,
      data: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error("Impersonate error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Impersonation failed." },
      { status: error instanceof Error && error.message.includes("ROLE_DENIED") ? 403 : 500 }
    );
  }
}
