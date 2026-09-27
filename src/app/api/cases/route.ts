import { NextResponse } from "next/server";
import { listCases } from "@/lib/case-workflow/engine";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    await getAuthenticatedUser();
  } catch {
    // Non-blocking for domain schema discovery
  }
  return NextResponse.json({ success: true, data: listCases() });
}
