import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAnyRole, getUserPermissions } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAnyRole(["admin", "super_admin"]);
    const { id: userId } = await params;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const permissions = await getUserPermissions(user.id, user.role);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        role: user.role,
        permissions,
      },
    });
  } catch (error) {
    console.error("Admin user permissions error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load permissions." },
      { status: 500 }
    );
  }
}
