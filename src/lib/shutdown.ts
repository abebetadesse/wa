/**
 * Work to finish before the process exits (buffered audit events, background task loops).
 *
 * The hooks live on globalThis so the production entry point (app.js), which is outside the
 * Next.js bundle, can run them when the host sends SIGTERM/SIGINT.
 */
type Hook = () => Promise<unknown> | unknown;

const g = globalThis as unknown as { __ethioShutdownHooks?: Map<string, Hook> };

/** Registers (or replaces, after a hot reload) the hook with this name. */
export function onShutdown(name: string, hook: Hook) {
  g.__ethioShutdownHooks ??= new Map();
  g.__ethioShutdownHooks.set(name, hook);
}

/** Runs every hook once, waiting at most `timeoutMs`. Never throws. */
export async function runShutdownHooks(timeoutMs = 5_000) {
  const all = [...(g.__ethioShutdownHooks?.values() ?? [])].map((hook) => Promise.resolve().then(hook));
  let timer: NodeJS.Timeout | undefined;
  await Promise.race([
    Promise.allSettled(all),
    new Promise((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    }),
  ]);
  clearTimeout(timer);
}
