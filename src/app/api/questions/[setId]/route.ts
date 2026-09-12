import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/case-workflow/engine";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  return NextResponse.json({ success: true, data: getQuestions(setId) });
}
