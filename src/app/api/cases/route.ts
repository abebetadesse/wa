import { NextResponse } from "next/server";
import { listCases } from "@/lib/case-workflow/engine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuthenticatedUser();
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication required. Please sign in or register." },
      { status: 401 }
    );
  }
  return NextResponse.json({ success: true, data: listCases() });
}
