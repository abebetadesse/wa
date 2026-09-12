import { NextRequest, NextResponse } from "next/server";
import { searchMechanisms } from "@/lib/discovery/mechanismEngine";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const type = request.nextUrl.searchParams.get("type") || "all";
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 20, 1), 50);
  if (query.length < 2) return NextResponse.json({ success: false, error: "Search query must be at least 2 characters." }, { status: 400 });
  if (!["medication", "symptom", "condition", "all"].includes(type)) return NextResponse.json({ success: false, error: "Invalid search type." }, { status: 400 });
  return NextResponse.json({ success: true, data: searchMechanisms(query, type as "medication" | "symptom" | "condition" | "all", limit) }, { headers: { "Cache-Control": "private, max-age=60" } });
}
