/**
 * Server-Sent Events stream of realtime updates for the signed-in user.
 * The browser's EventSource reconnects automatically and sends Last-Event-ID, so missed
 * events are replayed from the outbox.
 */
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { membershipsOf } from "@/server/marketplace/access";
import { businessChannel, replay, subscribe, userChannel, type RealtimeEvent } from "@/server/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_MS = 25_000;

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return new Response("Authentication required.", { status: 401 });

  const memberships = await membershipsOf(user.id);
  const channels = [userChannel(user.id), ...memberships.map((m) => businessChannel(m.businessId))];
  const lastId = Number(req.headers.get("last-event-id") ?? req.nextUrl.searchParams.get("after") ?? 0) || 0;

  const encoder = new TextEncoder();
  let cleanup: () => void = () => {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let highest = lastId;
      const send = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };
      const sendEvent = (event: RealtimeEvent) => {
        if (event.id <= highest) return;
        highest = event.id;
        send(`id: ${event.id}\nevent: message\ndata: ${JSON.stringify(event)}\n\n`);
      };

      send(`retry: 5000\n: connected ${channels.length} channels\n\n`);

      // Subscribe first, then replay, so nothing slips between the two.
      const buffered: RealtimeEvent[] = [];
      let replaying = true;
      const unsubscribe = await subscribe(channels, (event) => (replaying ? buffered.push(event) : sendEvent(event)));
      if (lastId > 0) for (const event of await replay(channels, lastId)) sendEvent(event);
      replaying = false;
      buffered.sort((a, b) => a.id - b.id).forEach(sendEvent);

      const heartbeat = setInterval(() => send(`: ping\n\n`), HEARTBEAT_MS);
      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
