import { NextRequest, NextResponse } from "next/server";
import { compareMechanisms } from "@/lib/discovery/mechanismEngine";

export async function GET(request: NextRequest) {
  const item1 = request.nextUrl.searchParams.get("item1")?.trim() || "";
  const item2 = request.nextUrl.searchParams.get("item2")?.trim() || "";
  if (item1.length < 2 || item2.length < 2) return NextResponse.json({ success: false, error: "Provide item1 and item2." }, { status: 400 });
  return NextResponse.json({ success: true, data: compareMechanisms(item1, item2) });
}
