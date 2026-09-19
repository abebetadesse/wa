import { NextResponse } from "next/server";
import { processAIChatMessage } from "@/lib/profiling/chat/aiChatEngine";
import { bionicChatStream, buildBionicMessages, isBionicConfigured, BionicGPTError } from "@/lib/ai/bionicGPT";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const url = new URL(req.url);
    const wantsStream = url.searchParams.get("stream") === "true";
    const body = await req.json();
    const { message, systemPrompt, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // ── Streaming path ─────────────────────────────────────────────────────────
    if (wantsStream && isBionicConfigured()) {
      try {
        const messages = buildBionicMessages(
          systemPrompt || "You are a helpful Ethiopian wellness assistant.",
          (history || [{ role: "user" as const, content: message }]).slice(-12)
        );

        const stream = await bionicChatStream({ messages, temperature: 0.75, maxTokens: 800 });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            Connection: "keep-alive",
          },
        });
      } catch (err) {
        const errMsg = err instanceof BionicGPTError ? err.message : String(err);
        console.warn(`[BionicGPT Stream] Error: ${errMsg}. Falling back to full response.`);
        // Fall through to standard path
      }
    }

    // ── Standard path (non-streaming) ─────────────────────────────────────────
    const { assistantMessage, session, usedLLM } = await processAIChatMessage(sessionId, message);

    return NextResponse.json({
      success: true,
      sessionId,
      response: assistantMessage.content,
      message: assistantMessage,
      userContext: session.userContext,
      usedLLM,
      disclaimer: PLATFORM_DISCLAIMERS.aiChat,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process chat message" }, { status: 500 });
  }
}
