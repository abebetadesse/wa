import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userActivities, loginHistory } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAnyRole(["admin", "super_admin"]);
    const { id: userId } = await params;

    const activities = await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(50);

    const logins = await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.createdAt))
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        activities,
        loginHistory: logins,
      },
    });
  } catch (error) {
    console.error("Admin user activity error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load activity." },
      { status: 500 }
    );
  }
}
