/**
 * Realtime delivery.
 *
 *   publish()  → INSERT into realtime_events (in the caller's transaction when given one)
 *   trigger    → pg_notify('realtime_events', {id, channel})           (see drizzle/0004_marketplace.sql)
 *   listener   → one LISTEN connection per server instance → in-process fan-out
 *   /api/realtime (SSE) → replays missed events by id, then streams live ones
 *
 * Channels: "user:<uuid>" for a person, "business:<uuid>" for everyone working in a business.
 */
import { EventEmitter } from "node:events";
import { and, asc, eq, gt, inArray, lt } from "drizzle-orm";
import { db, pgClient } from "@/lib/db";
import { realtimeEvents } from "@/lib/db/schema";

export type RealtimeChannel = `user:${string}` | `business:${string}`;

export interface RealtimeEvent {
  id: number;
  channel: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

type Executor = Pick<typeof db, "insert">;

export const userChannel = (userId: string): RealtimeChannel => `user:${userId}`;
export const businessChannel = (businessId: string): RealtimeChannel => `business:${businessId}`;

/** Records an event for each channel. Pass the transaction so events commit with the change. */
export async function publish(
  channels: RealtimeChannel | RealtimeChannel[],
  type: string,
  payload: Record<string, unknown> = {},
  executor: Executor = db,
) {
  const list = [...new Set(Array.isArray(channels) ? channels : [channels])];
  if (!list.length) return;
  await executor.insert(realtimeEvents).values(list.map((channel) => ({ channel, type, payload })));
}

// ── Listener (one per process) ───────────────────────────────────────────────

const globalForRealtime = globalThis as unknown as { realtimeBus?: EventEmitter; realtimeListening?: Promise<void> };
const bus = globalForRealtime.realtimeBus ?? new EventEmitter();
bus.setMaxListeners(0);
globalForRealtime.realtimeBus = bus;

const RETENTION_DAYS = 7;

function ensureListening() {
  globalForRealtime.realtimeListening ??= (async () => {
    await pgClient.listen("realtime_events", async (raw) => {
      try {
        const { id, channel } = JSON.parse(raw) as { id: number; channel: string };
        if (bus.listenerCount(channel) === 0) return;
        const [row] = await db.select().from(realtimeEvents).where(eq(realtimeEvents.id, id)).limit(1);
        if (row) bus.emit(channel, toEvent(row));
      } catch (error) {
        console.error("[realtime] failed to dispatch notification:", error);
      }
    });
    // Housekeeping: drop events older than the retention window once per day.
    const prune = () =>
      db
        .delete(realtimeEvents)
        .where(lt(realtimeEvents.createdAt, new Date(Date.now() - RETENTION_DAYS * 86_400_000)))
        .catch((error) => console.error("[realtime] prune failed:", error));
    prune();
    setInterval(prune, 86_400_000).unref?.();
  })().catch((error) => {
    globalForRealtime.realtimeListening = undefined;
    throw error;
  });
  return globalForRealtime.realtimeListening;
}

function toEvent(row: typeof realtimeEvents.$inferSelect): RealtimeEvent {
  return {
    id: row.id,
    channel: row.channel,
    type: row.type,
    payload: row.payload ?? {},
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

/** Events after `afterId` on the given channels (for reconnects). */
export async function replay(channels: string[], afterId: number, limit = 200) {
  if (!channels.length) return [];
  const rows = await db
    .select()
    .from(realtimeEvents)
    .where(and(inArray(realtimeEvents.channel, channels), gt(realtimeEvents.id, afterId)))
    .orderBy(asc(realtimeEvents.id))
    .limit(limit);
  return rows.map(toEvent);
}

/** Subscribes to live events on the given channels. Returns an unsubscribe function. */
export async function subscribe(channels: string[], onEvent: (event: RealtimeEvent) => void) {
  await ensureListening();
  for (const channel of channels) bus.on(channel, onEvent);
  return () => {
    for (const channel of channels) bus.off(channel, onEvent);
  };
}
