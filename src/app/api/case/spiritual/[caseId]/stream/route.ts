import { NextRequest } from "next/server";
import { getSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const session = getSpiritualCase(caseId);

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
        const current = getSpiritualCase(caseId);
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
