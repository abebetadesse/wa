import { NextRequest, NextResponse } from "next/server";
import { assessMultimodalConstitution, MultimodalInput } from "@/lib/cultural/multimodalConstitution";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = body as MultimodalInput;
    if (!input || typeof input !== "object" || !input.constitution || !input.pulse || !input.tongue || !input.vitals) {
      return NextResponse.json({ success: false, error: "Provide constitution, pulse, tongue, and vitals sections." }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: assessMultimodalConstitution(input) });
  } catch (error) {
    console.error("Integrative assessment error:", error);
    return NextResponse.json({ success: false, error: "Unable to create the integrative wellness assessment." }, { status: 400 });
  }
}
