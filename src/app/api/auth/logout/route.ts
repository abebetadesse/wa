import { NextResponse } from "next/server";
import { clearAuth } from "@/lib/auth";

export async function POST() {
  try { await clearAuth(); } catch (error) { console.error("Logout error:", error); }
  return NextResponse.json({ success: true });
}
