import { NextRequest, NextResponse } from "next/server";
import { parsehealthInquiry } from "@/lib/inquiry/parser";
import { retrieveInquiryKnowledge } from "@/lib/inquiry/knowledgeRetrieval";
import { synthesizeInquiry } from "@/lib/inquiry/solutionSynthesis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (query.length < 2) {
      return NextResponse.json({ success: false, error: "Please describe your concern in a few words." }, { status: 400 });
    }

    if (query.length > 2000) {
      return NextResponse.json({ success: false, error: "Please keep the concern under 2,000 characters." }, { status: 400 });
    }

    const inquiry = parsehealthInquiry(query);
    const knowledge = await retrieveInquiryKnowledge(inquiry);
    const synthesis = synthesizeInquiry(inquiry, knowledge);

    return NextResponse.json({ success: true, data: { inquiry, knowledge, synthesis } });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to analyze this concern." }, { status: 400 });
  }
}
