import { NextRequest, NextResponse } from "next/server";
import { analyzeNameIdentity } from "@/lib/profiling/naming/culturalAnalyzer";
import { searchEthiopianNames } from "@/lib/profiling/naming/nameDatabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fullName = searchParams.get("fullName") || "Tigist Mulugeta";
  const search = searchParams.get("search");

  try {
    if (search) {
      const searchResults = searchEthiopianNames(search);
      return NextResponse.json({ success: true, count: searchResults.length, results: searchResults });
    }

    const naming = analyzeNameIdentity(fullName);
    return NextResponse.json({ success: true, naming });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName } = body;

    if (!fullName) {
      return NextResponse.json({ success: false, error: "fullName is required" }, { status: 400 });
    }

    const naming = analyzeNameIdentity(fullName);
    return NextResponse.json({ success: true, naming });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
