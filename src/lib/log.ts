/**
 * Structured server log: one JSON line per event, the same shape `onRequestError` in
 * src/instrumentation.ts writes, so the host's log viewer (Plesk → Logs) and any log shipper can
 * filter by level, source and message.
 *
 *   log.error("payment webhook failed", { source: "chapa", error })
 *
 * Never pass request bodies, cookies, tokens or personal data in `fields`.
 */
type Level = "error" | "warn" | "info";
type Fields = Record<string, unknown> & { error?: unknown };

const MAX_STRING = 2000;

function describeError(error: unknown) {
  if (error instanceof Error) {
    return { error: error.message.slice(0, MAX_STRING), errorName: error.name, stack: error.stack?.split("\n").slice(0, 6).join("\n") };
  }
  return error === undefined ? {} : { error: String(error).slice(0, MAX_STRING) };
}

function clip(value: unknown): unknown {
  return typeof value === "string" && value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
}

/** The line that would be written; exported for tests. */
export function formatLogLine(level: Level, message: string, fields: Fields = {}, now = new Date()): string {
  const { error, ...rest } = fields;
  const entry: Record<string, unknown> = { level, time: now.toISOString(), message: clip(message) };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && !(key in entry)) entry[key] = clip(value);
  }
  Object.assign(entry, describeError(error));
  try {
    return JSON.stringify(entry);
  } catch {
    return JSON.stringify({ level, time: entry.time, message: entry.message, serialisable: false });
  }
}

function write(level: Level, message: string, fields?: Fields) {
  const line = formatLogLine(level, message, fields);
  if (level === "info") console.log(line);
  else console.error(line);
}

export const log = {
  error: (message: string, fields?: Fields) => write("error", message, fields),
  warn: (message: string, fields?: Fields) => write("warn", message, fields),
  info: (message: string, fields?: Fields) => write("info", message, fields),
};
