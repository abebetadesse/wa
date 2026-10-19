/**
 * Background tasks: one run per interval across processes, retries with back-off, health summary,
 * structured log lines and shutdown hooks. The MySQL lease test is skipped when the database is
 * unreachable.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { createMemoryTaskStore, createTaskRunner, retryDelaySeconds, summariseTasks } from "../server/jobs/runner.ts";
import { backgroundTasks } from "../server/jobs/index.ts";
import { formatLogLine } from "../lib/log.ts";
import { onShutdown, runShutdownHooks } from "../lib/shutdown.ts";
import { migrationStatements } from "../../scripts/table-prefix.mjs";

const quiet = async (fn) => {
  const [error, info] = [console.error, console.log];
  console.error = () => {};
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.error = error;
    console.log = info;
  }
};

function clockAt(start = Date.UTC(2026, 0, 1)) {
  let now = start;
  return { now: () => now, advance: (seconds) => (now += seconds * 1000) };
}

test("a due task runs once, then waits for its interval", async () => {
  const clock = clockAt();
  const store = createMemoryTaskStore(clock.now);
  let runs = 0;
  const runner = createTaskRunner({ store, owner: "a", tasks: [{ name: "t", everySeconds: 3600, run: async () => runs++ }] });

  await quiet(async () => {
    assert.deepEqual(await runner.tick(), ["t"]);
    assert.deepEqual(await runner.tick(), []);
    clock.advance(3599);
    assert.deepEqual(await runner.tick(), []);
    clock.advance(1);
    assert.deepEqual(await runner.tick(), ["t"]);
  });
  assert.equal(runs, 2);
});

test("two processes ticking at the same moment run a task only once", async () => {
  const store = createMemoryTaskStore(clockAt().now);
  let runs = 0;
  const task = { name: "t", everySeconds: 60, run: async () => runs++ };
  const first = createTaskRunner({ store, owner: "p1", tasks: [task] });
  const second = createTaskRunner({ store, owner: "p2", tasks: [task] });
  const [a, b] = await quiet(() => Promise.all([first.tick(), second.tick()]));
  assert.equal(a.length + b.length, 1);
  assert.equal(runs, 1);
});

test("a failed task is retried with back-off and reported", async () => {
  const clock = clockAt();
  const store = createMemoryTaskStore(clock.now);
  let fail = true;
  const runner = createTaskRunner({
    store,
    owner: "a",
    tasks: [{ name: "flaky", everySeconds: 86400, run: async () => { if (fail) throw new Error("upstream down"); } }],
  });

  await quiet(() => runner.tick());
  let [state] = await store.list();
  assert.equal(state.consecutiveFailures, 1);
  assert.equal(state.lastError, "upstream down");

  clock.advance(59);
  assert.deepEqual(await quiet(() => runner.tick()), [], "waits a minute before the first retry");
  clock.advance(1);
  fail = false;
  assert.deepEqual(await quiet(() => runner.tick()), ["flaky"]);
  [state] = await store.list();
  assert.equal(state.consecutiveFailures, 0);
  assert.equal(state.lastError, null);
  assert.ok(state.lastSuccessAt);
});

test("a lease left by a crashed process expires and another process takes over", async () => {
  const clock = clockAt();
  const store = createMemoryTaskStore(clock.now);
  await store.ensure("t", 60);
  assert.equal(await store.claim("t", "crashed", 600), true);
  assert.equal(await store.claim("t", "other", 600), false);
  clock.advance(601);
  assert.equal(await store.claim("t", "other", 600), true);
});

test("retry delay doubles from one minute and never exceeds the interval", () => {
  assert.equal(retryDelaySeconds({ everySeconds: 86400 }, 1), 60);
  assert.equal(retryDelaySeconds({ everySeconds: 86400 }, 2), 120);
  assert.equal(retryDelaySeconds({ everySeconds: 86400 }, 3), 240);
  assert.equal(retryDelaySeconds({ everySeconds: 300 }, 5), 300);
  assert.equal(retryDelaySeconds({ everySeconds: 86400 }, 50), 3840);
});

test("health summary marks tasks stale without exposing error text", () => {
  const now = Date.UTC(2026, 0, 3);
  const summary = summariseTasks(
    [
      { name: "fresh", everySeconds: 86400, lastSuccessAt: new Date(now - 3600_000), lastErrorAt: null, lastError: null, consecutiveFailures: 0, runCount: 3, running: false },
      { name: "old", everySeconds: 3600, lastSuccessAt: new Date(now - 3 * 3600_000), lastErrorAt: null, lastError: "secret detail", consecutiveFailures: 2, runCount: 9, running: false },
      { name: "never", everySeconds: 60, lastSuccessAt: null, lastErrorAt: new Date(now), lastError: "boom", consecutiveFailures: 1, runCount: 1, running: false },
    ],
    now,
  );
  assert.deepEqual(summary.stale, ["old", "never"]);
  assert.ok(!JSON.stringify(summary).includes("secret detail"));
});

test("literature sync is scheduled only when switched on", () => {
  assert.deepEqual(backgroundTasks({}).map((task) => task.name), ["follow_ups.send"]);
  assert.deepEqual(backgroundTasks({ LITERATURE_SYNC: "on" }).map((task) => task.name), ["follow_ups.send", "literature.sync"]);
});

test("log lines are single JSON objects with error details and clipped strings", () => {
  const line = formatLogLine("error", "task failed", { source: "jobs", error: new Error("boom"), long: "x".repeat(5000), level: "ignored" }, new Date(0));
  assert.ok(!line.includes("\n"));
  const entry = JSON.parse(line);
  assert.equal(entry.level, "error");
  assert.equal(entry.time, "1970-01-01T00:00:00.000Z");
  assert.equal(entry.message, "task failed");
  assert.equal(entry.source, "jobs");
  assert.equal(entry.error, "boom");
  assert.ok(entry.stack.startsWith("Error: boom"));
  assert.ok(entry.long.length < 2100);
});

test("shutdown hooks all run, and a stuck hook cannot hold the process", async () => {
  const ran = [];
  onShutdown("test-a", () => ran.push("a"));
  onShutdown("test-b", async () => ran.push("b"));
  onShutdown("test-stuck", () => new Promise(() => {}));
  const started = Date.now();
  await runShutdownHooks(200);
  assert.deepEqual(ran.sort(), ["a", "b"]);
  assert.ok(Date.now() - started < 2000);
  globalThis.__ethioShutdownHooks.delete("test-stuck");
});

test("browser error reports are accepted without sign-in and keep only the path", async () => {
  const { POST } = await import("../app/api/client-errors/route.ts");
  const lines = [];
  const original = console.error;
  console.error = (line) => lines.push(line);
  try {
    const res = await POST(
      new NextRequest("http://localhost/api/client-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Cannot read properties of undefined", path: "/case/workflows?token=secret" }),
      }),
      { params: Promise.resolve({}) },
    );
    assert.equal(res.status, 202);
  } finally {
    console.error = original;
  }
  const entry = JSON.parse(lines.find((line) => line.includes("browser error")));
  assert.equal(entry.path, "/case/workflows");
  assert.equal(entry.browserMessage, "Cannot read properties of undefined");
});

test("the scheduled-tasks migration is accepted by the table-prefix rewriter", () => {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, "../../drizzle-mysql/0004_scheduled_tasks.sql"), "utf8");
  const [statement] = migrationStatements(source, "wa_");
  assert.match(statement, /CREATE TABLE IF NOT EXISTS `wa_scheduled_tasks`/);
});

// ─── MySQL ───────────────────────────────────────────────────────────────────

const { dbClient } = await import("../lib/db/index.ts");
let available = true;
try {
  const [row] = await dbClient`SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE '%scheduled_tasks'`;
  available = Number(row.n) > 0;
} catch {
  available = false;
}

test("MySQL lease: of many simultaneous claims exactly one wins", { skip: !available && "database unavailable" }, async () => {
  const { dbTaskStore } = await import("../server/jobs/runner.ts");
  const name = `test.lease.${Date.now()}`;
  await dbTaskStore.ensure(name, 60);
  try {
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => dbTaskStore.claim(name, `p${i}`, 60)));
    assert.equal(results.filter(Boolean).length, 1);
    const winner = `p${results.indexOf(true)}`;
    await dbTaskStore.succeed(name, winner, 60);
    const state = (await dbTaskStore.list()).find((task) => task.name === name);
    assert.equal(state.runCount, 1);
    assert.equal(state.running, false);
    assert.equal(await dbTaskStore.claim(name, "late", 60), false, "not due again until the interval passes");
  } finally {
    const { db } = await import("../lib/db/index.ts");
    const { scheduledTasks } = await import("../lib/db/schema/index.ts");
    const { eq } = await import("drizzle-orm");
    await db.delete(scheduledTasks).where(eq(scheduledTasks.name, name));
  }
});
