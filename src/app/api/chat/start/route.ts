import { NextResponse } from "next/server";
import { getOrCreateChatSession } from "@/lib/profiling/chat/aiChatEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId = "user_default", userProfile } = body;

    const session = getOrCreateChatSession(userId, userProfile);

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      userContext: session.userContext,
      initialMessages: session.messages,
      disclaimer: PLATFORM_DISCLAIMERS.aiChat,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to start AI chat session" }, { status: 500 });
  }
}
