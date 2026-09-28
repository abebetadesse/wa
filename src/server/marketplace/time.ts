/** Pure timezone helpers (no dependencies). Businesses store their IANA timezone. */

/** Offset in minutes of `timeZone` from UTC at the given instant. */
export function tzOffsetMinutes(instant: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/** The UTC instant for a local wall-clock time ("2026-10-01", 540 → 09:00 local). */
export function localToUtc(date: string, minuteOfDay: number, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, 0, minuteOfDay));
  const offset = tzOffsetMinutes(guess, timeZone);
  const adjusted = new Date(guess.getTime() - offset * 60_000);
  // Re-check once in case the offset differs at the adjusted instant (DST edges).
  const second = tzOffsetMinutes(adjusted, timeZone);
  return second === offset ? adjusted : new Date(guess.getTime() - second * 60_000);
}

/** Local weekday (0 = Sunday) of a calendar date; timezone-independent. */
export function weekdayOf(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Today's calendar date ("YYYY-MM-DD") in the timezone. */
export function todayIn(timeZone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export interface Interval {
  start: number;
  end: number;
}

/**
 * Bookable slot start times (UTC ms) within opening windows, avoiding busy intervals.
 * `step` is the grid between slot starts; `duration` includes any buffer.
 */
export function computeSlots(input: {
  windows: Interval[];
  busy: Interval[];
  duration: number;
  step: number;
  notBefore: number;
}) {
  const slots: number[] = [];
  const busy = [...input.busy].sort((a, b) => a.start - b.start);
  for (const window of input.windows) {
    for (let start = window.start; start + input.duration <= window.end; start += input.step) {
      if (start < input.notBefore) continue;
      const end = start + input.duration;
      if (!busy.some((interval) => interval.start < end && interval.end > start)) slots.push(start);
    }
  }
  return slots;
}
