/**
 * Which feasts, fasts, commemorations and holidays fall on a date, from the editable rules in
 * `guidance_calendar_days`. The rules are plain data so a tradition expert can correct them from the
 * admin page; this module only knows how to place a rule on the calendar.
 */
import {
  addDays,
  daysBetween,
  ethiopianToGregorian,
  gregorianToEthiopian,
  gregorianToHijri,
  hijriToGregorian,
  orthodoxEaster,
  weekdayOf,
  westernEaster,
  type HijriMonthStart,
} from "./calendar";

export const TRADITIONS = ["orthodox", "muslim", "catholic", "protestant", "public"] as const;
export type Tradition = (typeof TRADITIONS)[number];
export const DAY_KINDS = ["feast", "fast", "commemoration", "holiday", "worship"] as const;
export type DayKind = (typeof DAY_KINDS)[number];
export const DAY_ANCHORS = ["fixed", "monthly", "weekly", "orthodox_easter", "western_easter"] as const;
export type DayAnchor = (typeof DAY_ANCHORS)[number];
export type RuleCalendar = "ethiopian" | "gregorian" | "hijri";

export interface Localized {
  en: string;
  am?: string;
  om?: string;
}

export interface DayEffects {
  /** Added to the religion score of every event on this day (negative for a penalty). */
  score?: number;
  /** Service slugs this day should be avoided for. */
  avoidFor?: string[];
  /** Service slugs this day is especially good for. */
  favourFor?: string[];
  /** Government offices and banks are closed. */
  officesClosed?: boolean;
  note?: Localized;
  /** The rule does not apply on a day that also has one of these rules of the same tradition. */
  exceptKeys?: string[];
  /** The rule does not apply in this many days after Easter (e.g. the fifty days without fasting). */
  exceptEasterRange?: { anchor: "orthodox_easter" | "western_easter"; from: number; to: number };
}

export interface CalendarDayRule {
  tradition: Tradition;
  entryKey: string;
  kind: DayKind;
  anchor: DayAnchor;
  calendar: RuleCalendar;
  month: number | null;
  day: number | null;
  offsetDays: number;
  lengthDays: number;
  untilMonth: number | null;
  untilDay: number | null;
  names: Localized;
  effects: DayEffects;
  active: boolean;
  validated: boolean;
}

function easterOf(anchor: "orthodox_easter" | "western_easter", year: number): string {
  return anchor === "orthodox_easter" ? orthodoxEaster(year) : westernEaster(year);
}

/** Gregorian date of a calendar date, or null when that date does not exist that year. */
function toGregorian(calendar: RuleCalendar, year: number, month: number, day: number, overrides: readonly HijriMonthStart[]): string | null {
  try {
    if (calendar === "ethiopian") return ethiopianToGregorian(year, month, day);
    if (calendar === "hijri") return hijriToGregorian(year, month, day, overrides);
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const check = new Date(`${iso}T00:00:00Z`);
    return check.getUTCMonth() + 1 === month && check.getUTCDate() === day ? iso : null;
  } catch {
    return null;
  }
}

function yearIn(calendar: RuleCalendar, date: string, overrides: readonly HijriMonthStart[]): { year: number; month: number; day: number } {
  if (calendar === "ethiopian") return gregorianToEthiopian(date);
  if (calendar === "hijri") return gregorianToHijri(date, overrides);
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function within(date: string, start: string | null, end: string | null): boolean {
  return Boolean(start && end && daysBetween(start, date) >= 0 && daysBetween(date, end) >= 0);
}

/** End of a period that starts on `start`: an "until" date in the rule's calendar, or `lengthDays` long. */
function periodEnd(rule: CalendarDayRule, start: string, overrides: readonly HijriMonthStart[]): string | null {
  if (rule.untilMonth && rule.untilDay) {
    const calendar = rule.anchor === "fixed" ? rule.calendar : "ethiopian";
    const { year } = yearIn(calendar, start, overrides);
    const end = toGregorian(calendar, year, rule.untilMonth, rule.untilDay, overrides);
    if (end && daysBetween(start, end) >= 0) return end;
    return toGregorian(calendar, year + 1, rule.untilMonth, rule.untilDay, overrides);
  }
  return addDays(start, Math.max(1, rule.lengthDays) - 1);
}

function placedOn(rule: CalendarDayRule, date: string, overrides: readonly HijriMonthStart[]): boolean {
  switch (rule.anchor) {
    case "weekly":
      return rule.day !== null && weekdayOf(date) === rule.day;
    case "monthly": {
      const d = yearIn(rule.calendar, date, overrides);
      return d.day === rule.day && !(rule.calendar === "ethiopian" && d.month === 13);
    }
    case "orthodox_easter":
    case "western_easter": {
      const year = Number(date.slice(0, 4));
      const start = addDays(easterOf(rule.anchor, year), rule.offsetDays);
      return within(date, start, periodEnd(rule, start, overrides));
    }
    case "fixed": {
      if (rule.month === null) return false;
      const here = yearIn(rule.calendar, date, overrides);
      if (rule.day === null) return here.month === rule.month;
      // A period may have started in the previous year of its calendar.
      for (const year of [here.year, here.year - 1]) {
        const start = toGregorian(rule.calendar, year, rule.month, rule.day, overrides);
        if (start && within(date, start, periodEnd(rule, start, overrides))) return true;
      }
      return false;
    }
  }
}

/** Active rules that fall on `date`, after each rule's exceptions are applied. */
export function observancesOn(
  date: string,
  rules: readonly CalendarDayRule[],
  hijriOverrides: readonly HijriMonthStart[] = [],
): CalendarDayRule[] {
  const placed = rules.filter((rule) => rule.active && placedOn(rule, date, hijriOverrides));
  return placed.filter((rule) => {
    const { exceptKeys, exceptEasterRange } = rule.effects;
    if (exceptKeys?.length && placed.some((other) => other.tradition === rule.tradition && exceptKeys.includes(other.entryKey))) return false;
    if (exceptEasterRange) {
      const fromEaster = daysBetween(easterOf(exceptEasterRange.anchor, Number(date.slice(0, 4))), date);
      if (fromEaster >= exceptEasterRange.from && fromEaster <= exceptEasterRange.to) return false;
    }
    return true;
  });
}
