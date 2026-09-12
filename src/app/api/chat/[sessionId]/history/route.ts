import { NextResponse } from "next/server";
import { getOrCreateChatSession } from "@/lib/profiling/chat/aiChatEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const session = getOrCreateChatSession(sessionId.replace("session_", ""));

    return NextResponse.json({
      success: true,
      sessionId,
      messages: session.messages,
      userContext: session.userContext,
      disclaimer: PLATFORM_DISCLAIMERS.aiChat,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve chat history" }, { status: 500 });
  }
}
