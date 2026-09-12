import { NextRequest } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return new Response("Authentication required.", { status: 401 });
  }
  const session = getOwnedSpiritualCase(caseId, user.id);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial state
      if (session) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "status_update",
              status: session.status,
              estimatedMinutesRemaining: session.estimatedMinutesRemaining,
              expert: session.assignedExpert,
            })}\n\n`
          )
        );
      }

      // Interval to push updates / keep alive
      const interval = setInterval(() => {
        const current = getOwnedSpiritualCase(caseId, user.id);
        if (current) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status_update",
                status: current.status,
                estimatedMinutesRemaining: current.estimatedMinutesRemaining,
                expert: current.assignedExpert,
              })}\n\n`
            )
          );
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
