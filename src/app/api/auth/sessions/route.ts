import { NextResponse } from "next/server";
import { requireAuthenticatedUser, getUserSessions } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const sessions = await getUserSessions(user.id);
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error && error.message === "AUTH_REQUIRED" ? "Authentication required." : "Failed to load sessions." },
      { status: error instanceof Error && error.message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
