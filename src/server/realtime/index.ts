/**
 * Realtime delivery.
 *
 *   publish()  → INSERT into realtime_events (in the caller's transaction when given one)
 *   listener   → a MySQL event-table poller per server instance → in-process fan-out
 *   /api/realtime (SSE) → replays missed events by id, then streams live ones
 *
 * Channels: "user:<uuid>" for a person, "business:<uuid>" for everyone working in a business.
 */
import { EventEmitter } from "node:events";
import { and, asc, eq, gt, gte, inArray, lte, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
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

const globalForRealtime = globalThis as unknown as {
  realtimeBus?: EventEmitter;
  realtimeListening?: Promise<void>;
  realtimePolling?: ReturnType<typeof setInterval>;
  realtimeLastSeenId?: number;
  realtimePollRunning?: boolean;
  realtimeSeenIds?: Set<number>;
};
const bus = globalForRealtime.realtimeBus ?? new EventEmitter();
bus.setMaxListeners(0);
globalForRealtime.realtimeBus = bus;

const RETENTION_DAYS = 7;
const LATE_COMMIT_WINDOW_MS = 60_000;
const MAX_SEEN_IDS = 10_000;

function ensureListening() {
  globalForRealtime.realtimeListening ??= (async () => {
    const [latest] = await db.select({ id: sql<number>`COALESCE(MAX(${realtimeEvents.id}), 0)` }).from(realtimeEvents);
    globalForRealtime.realtimeLastSeenId ??= Number(latest.id);
    globalForRealtime.realtimeSeenIds ??= new Set();
    const recentRows = await db
      .select({ id: realtimeEvents.id })
      .from(realtimeEvents)
      .where(and(lte(realtimeEvents.id, globalForRealtime.realtimeLastSeenId), gte(realtimeEvents.createdAt, new Date(Date.now() - LATE_COMMIT_WINDOW_MS))))
      .orderBy(asc(realtimeEvents.id))
      .limit(MAX_SEEN_IDS);
    for (const row of recentRows) globalForRealtime.realtimeSeenIds.add(row.id);
    const poll = async () => {
      if (globalForRealtime.realtimePollRunning) return;
      globalForRealtime.realtimePollRunning = true;
      try {
        const rows = await db
          .select()
          .from(realtimeEvents)
          .where(or(
            gt(realtimeEvents.id, globalForRealtime.realtimeLastSeenId ?? 0),
            and(
              lte(realtimeEvents.id, globalForRealtime.realtimeLastSeenId ?? 0),
              gte(realtimeEvents.createdAt, new Date(Date.now() - LATE_COMMIT_WINDOW_MS)),
            ),
          ))
          .orderBy(asc(realtimeEvents.id))
          .limit(MAX_SEEN_IDS);
        for (const row of rows) {
          globalForRealtime.realtimeLastSeenId = Math.max(globalForRealtime.realtimeLastSeenId ?? 0, row.id);
          const seen = globalForRealtime.realtimeSeenIds!;
          if (seen.has(row.id)) continue;
          seen.add(row.id);
          if (seen.size > MAX_SEEN_IDS) seen.delete(seen.values().next().value!);
          if (bus.listenerCount(row.channel) > 0) bus.emit(row.channel, toEvent(row));
        }
      } catch (error) {
        console.error("[realtime] database polling failed:", error);
      } finally {
        globalForRealtime.realtimePollRunning = false;
      }
    };
    globalForRealtime.realtimePolling ??= setInterval(() => void poll(), 1_000);
    globalForRealtime.realtimePolling.unref?.();
    // Housekeeping: drop events older than the retention window once per day.
    const prune = () =>
      db
        .delete(realtimeEvents)
        .where(lt(realtimeEvents.createdAt, new Date(Date.now() - RETENTION_DAYS * 86_400_000)))
        .catch((error) => console.error("[realtime] prune failed:", error));
    void prune();
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
