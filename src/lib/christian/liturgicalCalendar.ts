export type LiturgicalEventType = "feast" | "fast";
export interface LiturgicalEvent { key: string; nameEn: string; nameAm: string; type: LiturgicalEventType; month: number; day: number; note?: string; }

const FIXED_EVENTS: LiturgicalEvent[] = [
  { key: "genna", nameEn: "Genna — Christmas", nameAm: "ገና", type: "feast", month: 1, day: 7 },
  { key: "timkat", nameEn: "Timkat — Epiphany", nameAm: "ጥምቀት", type: "feast", month: 1, day: 19 },
  { key: "meskel", nameEn: "Meskel — Finding of the True Cross", nameAm: "መስቀል", type: "feast", month: 9, day: 27 },
  { key: "filseta", nameEn: "Filseta — Assumption Fast", nameAm: "ጾመ ፍልሰታ", type: "fast", month: 8, day: 7, note: "15-day fast leading to Assumption." },
];

export function getLiturgicalContext(now = new Date()) {
  const today = FIXED_EVENTS.find((event) => event.month === now.getMonth() + 1 && event.day === now.getDate()) ?? null;
  const weeklyFast = now.getDay() === 3 || now.getDay() === 5;
  const upcoming = FIXED_EVENTS
    .map((event) => {
      const target = new Date(now.getFullYear(), event.month - 1, event.day);
      if (target < now) target.setFullYear(target.getFullYear() + 1);
      return { event, daysUntil: Math.ceil((target.getTime() - now.getTime()) / 86400000) };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)[0] ?? null;
  const summary = [
    today?.nameEn,
    weeklyFast ? "Weekly fast" : undefined,
    !today && !weeklyFast && upcoming && upcoming.daysUntil <= 7
      ? `${upcoming.event.nameEn} in ${upcoming.daysUntil} day${upcoming.daysUntil === 1 ? "" : "s"}`
      : undefined,
  ].filter(Boolean).join(" · ") || "Ordinary day";
  return { today, upcoming, weeklyFast, summary };
}
