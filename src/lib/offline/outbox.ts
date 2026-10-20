/**
 * Saves that could not reach the server, kept on this device and sent again when the connection
 * returns (the `online` event, or when the tab becomes visible again).
 *
 * Only whole-document PUTs are queued (for example a case's full answer set), so the newest save
 * for a URL replaces any older one and resending is always safe. A save the server refuses
 * (4xx: signed out, case gone, invalid) is dropped rather than retried forever; the page's own
 * draft in browser storage still holds the answers.
 */
const KEY = "ethio-outbox:v1";

export interface OutboxEntry {
  body: unknown;
  queuedAt: string;
}

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Fetch = (url: string, init: RequestInit) => Promise<Pick<Response, "ok" | "status">>;

function defaultStore(): Store | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function read(store: Store | null): Record<string, OutboxEntry> {
  try {
    const parsed = JSON.parse(store?.getItem(KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(store: Store | null, entries: Record<string, OutboxEntry>) {
  try {
    if (Object.keys(entries).length) store?.setItem(KEY, JSON.stringify(entries));
    else store?.removeItem(KEY);
  } catch {
    // Storage full or blocked: nothing more can be kept offline.
  }
}

/** Keeps this PUT to send later, replacing an older one for the same URL. */
export function queuePut(url: string, body: unknown, store: Store | null = defaultStore(), now = new Date()) {
  write(store, { ...read(store), [url]: { body, queuedAt: now.toISOString() } });
}

/** Forgets the queued save for a URL (a newer save just reached the server). */
export function clearQueued(url: string, store: Store | null = defaultStore()) {
  const entries = read(store);
  if (!(url in entries)) return;
  delete entries[url];
  write(store, entries);
}

export function isQueued(url: string, store: Store | null = defaultStore()) {
  return url in read(store);
}

/** Sends every queued save. Returns how many were delivered and how many are still waiting. */
export async function flushOutbox(fetchImpl: Fetch = fetch, store: Store | null = defaultStore()) {
  const finished: Array<[string, string]> = [];
  let sent = 0;
  for (const [url, entry] of Object.entries(read(store))) {
    try {
      const response = await fetchImpl(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.body),
      });
      if (response.ok) sent += 1;
      // Server errors are retried later; a refused save (4xx) would fail the same way again.
      if (response.ok || (response.status >= 400 && response.status < 500)) finished.push([url, entry.queuedAt]);
    } catch {
      // Still offline: keep it.
    }
  }
  // Re-read: a newer save queued while this ran must stay queued.
  const current = read(store);
  for (const [url, queuedAt] of finished) {
    if (current[url]?.queuedAt === queuedAt) delete current[url];
  }
  write(store, current);
  return { sent, remaining: Object.keys(current).length };
}

let started = false;

/** Sends queued saves whenever the connection or the tab comes back. Safe to call more than once. */
export function startOutboxSync(onFlushed?: (result: { sent: number; remaining: number }) => void) {
  if (typeof window === "undefined") return () => undefined;
  const run = () => {
    if (navigator.onLine === false) return;
    void flushOutbox().then((result) => onFlushed?.(result));
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") run();
  };
  window.addEventListener("online", run);
  document.addEventListener("visibilitychange", onVisible);
  if (!started) {
    started = true;
    run();
  }
  return () => {
    window.removeEventListener("online", run);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
