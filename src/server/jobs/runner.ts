/**
 * Recurring background tasks that run once per interval across all application processes.
 *
 * The host may run several processes (Passenger), so a task is never started from a plain timer:
 * each process ticks, and a task runs only in the process that wins its lease, an atomic UPDATE of
 * its `scheduled_tasks` row (`next_run_at <= now AND lease expired`). A process that dies mid-run
 * loses nothing: the lease expires and another process picks the task up.
 *
 *   JOBS_RUNNER=off     do not run background tasks in this process (on by default in production)
 */
import os from "node:os";
import crypto from "node:crypto";
import { and, eq, isNull, lt, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { scheduledTasks } from "@/lib/db/schema";
import { log } from "@/lib/log";

export interface ScheduledTask {
  name: string;
  everySeconds: number;
  /** How long the lease lasts; the task should finish well within it. Default: 10 minutes. */
  leaseSeconds?: number;
  run: () => Promise<unknown>;
}

export interface TaskState {
  name: string;
  everySeconds: number;
  lastSuccessAt: Date | null;
  lastErrorAt: Date | null;
  lastError: string | null;
  consecutiveFailures: number;
  runCount: number;
  running: boolean;
}

/** Where the schedule and leases are kept: MySQL in the application, memory in tests. */
export interface TaskStore {
  ensure(name: string, everySeconds: number): Promise<void>;
  claim(name: string, owner: string, leaseSeconds: number): Promise<boolean>;
  succeed(name: string, owner: string, nextInSeconds: number): Promise<void>;
  fail(name: string, owner: string, error: string, retryInSeconds: number): Promise<void>;
  list(): Promise<TaskState[]>;
}

const NOW = sql`UTC_TIMESTAMP(3)`;
const inSeconds = (seconds: number) => sql`TIMESTAMPADD(SECOND, ${Math.round(seconds)}, UTC_TIMESTAMP(3))`;

function affected(result: unknown): number {
  const header = Array.isArray(result) ? result[0] : result;
  return Number((header as { affectedRows?: number } | undefined)?.affectedRows ?? 0);
}

export const dbTaskStore: TaskStore = {
  async ensure(name, everySeconds) {
    await db
      .insert(scheduledTasks)
      .values({ name, everySeconds })
      .onDuplicateKeyUpdate({ set: { everySeconds } });
  },
  async claim(name, owner, leaseSeconds) {
    const result = await db
      .update(scheduledTasks)
      .set({ leaseOwner: owner, leaseUntil: inSeconds(leaseSeconds), lastStartedAt: NOW })
      .where(and(eq(scheduledTasks.name, name), lte(scheduledTasks.nextRunAt, NOW), or(isNull(scheduledTasks.leaseUntil), lt(scheduledTasks.leaseUntil, NOW))));
    return affected(result) === 1;
  },
  async succeed(name, owner, nextInSeconds) {
    await db
      .update(scheduledTasks)
      .set({
        leaseOwner: null,
        leaseUntil: null,
        nextRunAt: inSeconds(nextInSeconds),
        lastSuccessAt: NOW,
        lastError: null,
        consecutiveFailures: 0,
        runCount: sql`${scheduledTasks.runCount} + 1`,
      })
      .where(and(eq(scheduledTasks.name, name), eq(scheduledTasks.leaseOwner, owner)));
  },
  async fail(name, owner, error, retryInSeconds) {
    await db
      .update(scheduledTasks)
      .set({
        leaseOwner: null,
        leaseUntil: null,
        nextRunAt: inSeconds(retryInSeconds),
        lastErrorAt: NOW,
        lastError: error.slice(0, 1000),
        consecutiveFailures: sql`${scheduledTasks.consecutiveFailures} + 1`,
        runCount: sql`${scheduledTasks.runCount} + 1`,
      })
      .where(and(eq(scheduledTasks.name, name), eq(scheduledTasks.leaseOwner, owner)));
  },
  async list() {
    const rows = await db.select().from(scheduledTasks);
    const now = Date.now();
    return rows.map((row) => ({
      name: row.name,
      everySeconds: row.everySeconds,
      lastSuccessAt: row.lastSuccessAt,
      lastErrorAt: row.lastErrorAt,
      lastError: row.lastError,
      consecutiveFailures: row.consecutiveFailures,
      runCount: row.runCount,
      running: Boolean(row.leaseUntil && row.leaseUntil.getTime() > now),
    }));
  },
};

/** In-memory store with the same rules, for tests. `clock` lets a test move time forward. */
export function createMemoryTaskStore(clock: () => number = Date.now): TaskStore {
  type Row = TaskState & { nextRunAt: number; leaseOwner: string | null; leaseUntil: number | null };
  const rows = new Map<string, Row>();
  return {
    async ensure(name, everySeconds) {
      const row = rows.get(name);
      if (row) row.everySeconds = everySeconds;
      else rows.set(name, { name, everySeconds, nextRunAt: clock(), leaseOwner: null, leaseUntil: null, lastSuccessAt: null, lastErrorAt: null, lastError: null, consecutiveFailures: 0, runCount: 0, running: false });
    },
    async claim(name, owner, leaseSeconds) {
      const row = rows.get(name);
      if (!row || row.nextRunAt > clock() || (row.leaseUntil !== null && row.leaseUntil >= clock())) return false;
      row.leaseOwner = owner;
      row.leaseUntil = clock() + leaseSeconds * 1000;
      return true;
    },
    async succeed(name, owner, nextInSeconds) {
      const row = rows.get(name);
      if (!row || row.leaseOwner !== owner) return;
      Object.assign(row, { leaseOwner: null, leaseUntil: null, nextRunAt: clock() + nextInSeconds * 1000, lastSuccessAt: new Date(clock()), lastError: null, consecutiveFailures: 0, runCount: row.runCount + 1 });
    },
    async fail(name, owner, error, retryInSeconds) {
      const row = rows.get(name);
      if (!row || row.leaseOwner !== owner) return;
      Object.assign(row, { leaseOwner: null, leaseUntil: null, nextRunAt: clock() + retryInSeconds * 1000, lastErrorAt: new Date(clock()), lastError: error, consecutiveFailures: row.consecutiveFailures + 1, runCount: row.runCount + 1 });
    },
    async list() {
      return [...rows.values()].map(({ nextRunAt: _n, leaseOwner: _o, leaseUntil, ...state }) => ({ ...state, running: leaseUntil !== null && leaseUntil >= clock() }));
    },
  };
}

/**
 * Background task health for the public health check, without error text. A task is stale when
 * it has not succeeded for two of its intervals, or has never succeeded and is failing.
 */
export function summariseTasks(tasks: TaskState[], now = Date.now()) {
  const list = tasks.map((task) => {
    const sinceSuccess = task.lastSuccessAt ? Math.round((now - task.lastSuccessAt.getTime()) / 1000) : null;
    const stale = sinceSuccess === null ? task.consecutiveFailures > 0 : sinceSuccess > task.everySeconds * 2;
    return {
      name: task.name,
      everySeconds: task.everySeconds,
      lastSuccessAt: task.lastSuccessAt?.toISOString() ?? null,
      consecutiveFailures: task.consecutiveFailures,
      running: task.running,
      stale,
    };
  });
  return { tasks: list, stale: list.filter((task) => task.stale).map((task) => task.name) };
}

/** Wait before retrying a failed task: 1, 2, 4 … minutes, never longer than its interval. */
export function retryDelaySeconds(task: Pick<ScheduledTask, "everySeconds">, failures: number) {
  return Math.min(task.everySeconds, 60 * 2 ** Math.min(Math.max(failures - 1, 0), 6));
}

export function createTaskRunner(options: { tasks: ScheduledTask[]; store?: TaskStore; owner?: string }) {
  const store = options.store ?? dbTaskStore;
  const owner = options.owner ?? `${os.hostname()}:${process.pid}:${crypto.randomBytes(3).toString("hex")}`;
  const failures = new Map<string, number>();
  let ensured = false;

  /** Runs every task that is due and whose lease this process wins. Returns the names it ran. */
  async function tick(): Promise<string[]> {
    if (!ensured) {
      for (const task of options.tasks) await store.ensure(task.name, task.everySeconds);
      ensured = true;
    }
    const ran: string[] = [];
    for (const task of options.tasks) {
      if (!(await store.claim(task.name, owner, task.leaseSeconds ?? 600))) continue;
      ran.push(task.name);
      const started = Date.now();
      try {
        await task.run();
        failures.delete(task.name);
        await store.succeed(task.name, owner, task.everySeconds);
        log.info("background task finished", { source: "jobs", task: task.name, ms: Date.now() - started });
      } catch (error) {
        const count = (failures.get(task.name) ?? 0) + 1;
        failures.set(task.name, count);
        const message = error instanceof Error ? error.message : String(error);
        await store.fail(task.name, owner, message, retryDelaySeconds(task, count)).catch(() => null);
        log.error("background task failed", { source: "jobs", task: task.name, attempt: count, error });
      }
    }
    return ran;
  }

  return { owner, tick };
}
