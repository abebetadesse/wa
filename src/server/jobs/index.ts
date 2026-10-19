/**
 * The application's recurring background tasks, started once per process from
 * src/instrumentation.ts after the database is ready. See ./runner.ts for how a task runs only
 * once across processes.
 *
 *   JOBS_RUNNER=off       run no background tasks in this process
 *   LITERATURE_SYNC=on    fetch new research literature once a day (off by default: it calls
 *                         PubMed and, when configured, the language model)
 */
import { log } from "@/lib/log";
import { onShutdown } from "@/lib/shutdown";
import { createTaskRunner, type ScheduledTask } from "./runner";

const TICK_MS = 60_000;
const DAY = 24 * 60 * 60;

export function backgroundTasks(env: NodeJS.ProcessEnv = process.env): ScheduledTask[] {
  const tasks: ScheduledTask[] = [];
  if (env.LITERATURE_SYNC?.trim().toLowerCase() === "on") {
    tasks.push({
      name: "literature.sync",
      everySeconds: DAY,
      leaseSeconds: 2 * 60 * 60,
      run: async () => {
        const { getLiteratureFetcher } = await import("@/lib/literature/literatureFetcher");
        await getLiteratureFetcher().triggerManual();
      },
    });
  }
  return tasks;
}

const g = globalThis as unknown as { __ethioTasksStarted?: boolean };

/** Starts the tick loop once per process. Never throws. */
export function startBackgroundTasks() {
  if (g.__ethioTasksStarted) return;
  if (process.env.NODE_ENV !== "production" || process.env.JOBS_RUNNER?.trim().toLowerCase() === "off") return;
  const tasks = backgroundTasks();
  if (!tasks.length) return;
  g.__ethioTasksStarted = true;

  const runner = createTaskRunner({ tasks });
  let current: Promise<unknown> = Promise.resolve();
  let stopped = false;
  let warned = false;

  const tick = () => {
    if (stopped) return;
    current = runner.tick().then(
      () => {
        warned = false;
      },
      (error) => {
        // Usually the database is unreachable or the table is still being created; say so once.
        if (!warned) log.warn("background tasks could not run", { source: "jobs", error });
        warned = true;
      },
    );
  };

  const timer = setInterval(tick, TICK_MS);
  timer.unref();
  setTimeout(tick, 15_000).unref();
  onShutdown("background-tasks", async () => {
    stopped = true;
    clearInterval(timer);
    await current;
  });
  log.info("background tasks started", { source: "jobs", owner: runner.owner, tasks: tasks.map((task) => task.name) });
}
