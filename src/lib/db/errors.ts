/**
 * Recognising database errors by what they mean. Drizzle wraps the driver's error, so the MySQL
 * error number is looked for along the `cause` chain.
 */
const DUPLICATE_KEY = 1062; // ER_DUP_ENTRY: a unique value already exists
const DEADLOCK = 1213; // ER_LOCK_DEADLOCK: two transactions blocked each other; one was rolled back
const LOCK_WAIT_TIMEOUT = 1205; // ER_LOCK_WAIT_TIMEOUT: waited too long for another transaction

function errorNumber(error: unknown): number | undefined {
  for (let current = error, depth = 0; current && typeof current === "object" && depth < 5; depth++) {
    const errno = (current as { errno?: unknown }).errno;
    if (typeof errno === "number") return errno;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/** A unique constraint was violated. */
export const isDuplicateKey = (error: unknown) => errorNumber(error) === DUPLICATE_KEY;

/** A clash between concurrent transactions; the same request can simply be tried again. */
export const isTransientConflict = (error: unknown) => {
  const errno = errorNumber(error);
  return errno === DEADLOCK || errno === LOCK_WAIT_TIMEOUT;
};

/** The index or key named in a duplicate-key error, e.g. "users_phone_unique". */
export function duplicateKeyName(error: unknown): string | undefined {
  for (let current = error, depth = 0; current && typeof current === "object" && depth < 5; depth++) {
    const message = (current as { sqlMessage?: unknown }).sqlMessage;
    if (typeof message === "string") return message.match(/for key '(?:[^'.]+\.)?([^']+)'/)?.[1];
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}
