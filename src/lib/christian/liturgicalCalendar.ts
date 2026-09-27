/**
 * Ethiopian Orthodox fixed feasts and fasts.
 *
 * This is a *partial* calendar — the major fixed observances only. Movable
 * feasts (Easter, dependent fasts) are not computed here to avoid incorrect
 * guidance. Where movable, we return "seasonal" labels only.
 *
 * Sources: Ethiopian Orthodox Tewahedo Church liturgical calendar.
 */

export type LiturgicalEventType = 'feast' | 'fast' | 'season';

export interface LiturgicalEvent {
  key: string;
  nameEn: string;
  nameAm: string;
  type: LiturgicalEventType;
  month: number; // 1–12 (Gregorian)
  day: number;
  note?: string;
}

const FIXED_EVENTS: LiturgicalEvent[] = [
  { key: 'timkat', nameEn: 'Timkat — Epiphany', nameAm: 'ጥምቀት', type: 'feast', month: 1, day: 19, note: 'Celebrates the baptism of Jesus in the Jordan.' },
  { key: 'genna', nameEn: 'Genna — Christmas', nameAm: 'ገና', type: 'feast', month: 1, day: 7 },
  { key: 'advent-fast', nameEn: 'Fast of the Nativity', nameAm: 'ጾመ ልደት', type: 'fast', month: 11, day: 25, note: 'Begins ~43 days before Genna.' },
  { key: 'nineveh', nameEn: 'Fast of Nineveh', nameAm: 'ጾመ ነነዌ', type: 'fast', month: 1, day: 25, note: 'Three-day fast, ~2 weeks before Great Lent.' },
  { key: 'hosanna', nameEn: 'Hosanna', nameAm: 'ሆሳእና', type: 'feast', month: 4, day: 13, note: 'Palm Sunday — movable in some years.' },
  { key: 'meskel', nameEn: 'Meskel — Finding of the True Cross', nameAm: 'መስቀል', type: 'feast', month: 9, day: 27 },
  { key: 'filseta', nameEn: 'Filseta — Assumption Fast', nameAm: 'ጾመ ፍልሰታ', type: 'fast', month: 8, day: 7, note: '15-day fast leading to Assumption.' },
  { key: 'assumption', nameEn: 'Assumption of Mary', nameAm: 'ፍልሰታ', type: 'feast', month: 8, day: 22 },
];

/** Every Wednesday and Friday is a fasting day in the Ethiopian Orthodox tradition. */
function isWeeklyFast(date: Date): boolean {
  const day = date.getDay();
  return day === 3 || day === 5; // Wed or Fri
}

function isWithinDays(date: Date, event: LiturgicalEvent, windowDays: number): boolean {
  const year = date.getFullYear();
  const eventDate = new Date(year, event.month - 1, event.day);
  const diffDays = Math.round((date.getTime() - eventDate.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= windowDays;
}

function daysUntil(date: Date, event: LiturgicalEvent): number {
  const year = date.getFullYear();
  let target = new Date(year, event.month - 1, event.day);
  if (target.getTime() < date.getTime()) {
    target = new Date(year + 1, event.month - 1, event.day);
  }
  return Math.ceil((target.getTime() - date.getTime()) / 86400000);
}

export interface LiturgicalContext {
  /** An event happening today, if any. */
  today: LiturgicalEvent | null;
  /** The next upcoming fixed event. */
  upcoming: { event: LiturgicalEvent; daysUntil: number } | null;
  /** True if today is a Wednesday or Friday (weekly fast). */
  weeklyFast: boolean;
  /** A short human-readable summary, e.g. "Great Lent · Weekly fast". */
  summary: string;
}

export function getLiturgicalContext(now = new Date()): LiturgicalContext {
  const today = FIXED_EVENTS.find(
    (e) => e.month === now.getMonth() + 1 && e.day === now.getDate()
  ) ?? null;

  const upcoming = FIXED_EVENTS
    .map((e) => ({ event: e, daysUntil: daysUntil(now, e) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)[0] ?? null;

  const weeklyFast = isWeeklyFast(now);

  const parts: string[] = [];
  if (today) parts.push(today.nameEn);
  if (weeklyFast) parts.push('Weekly fast');
  if (!today && !weeklyFast && upcoming && upcoming.daysUntil <= 7) {
    parts.push(
      `${upcoming.event.nameEn} in ${upcoming.daysUntil} day${upcoming.daysUntil === 1 ? '' : 's'}`
    );
  }

  return {
    today,
    upcoming,
    weeklyFast,
    summary: parts.join(' · ') || 'Ordinary day',
  };
}