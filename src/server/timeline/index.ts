/** Loads one person's own records for the timeline (rules in ./timeline.ts). */
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, businesses, diagnosticSessions, followUps, services, wellbeingGapReports } from "@/lib/db/schema";
import { getDomainConfig } from "@/server/cases/domains";
import { dbCaseStore } from "@/server/cases/store";
import {
  bookingEvents,
  caseEvents,
  checkInEvents,
  clinicianSummary,
  mergeTimeline,
  nutritionReportEvents,
  symptomCheckEvents,
  type AnsweredCheckIn,
} from "./timeline";

export * from "./timeline";

/** A source that fails (for example a table not created yet) leaves its events out instead of failing the page. */
const orEmpty = <T>(work: Promise<T[]>) => work.catch(() => [] as T[]);

export async function buildTimeline(userId: string) {
  const [cases, checkIns, bookingRows, symptomRows, reportRows] = await Promise.all([
    orEmpty(dbCaseStore.listByUser(userId)),
    orEmpty(
      db
        .select({
          id: followUps.id,
          caseId: followUps.caseId,
          bookingId: followUps.bookingId,
          label: followUps.label,
          dayOffset: followUps.dayOffset,
          answeredAt: followUps.answeredAt,
          helped: followUps.helped,
          sideEffects: followUps.sideEffects,
          comment: followUps.comment,
        })
        .from(followUps)
        .where(and(eq(followUps.userId, userId), isNotNull(followUps.answeredAt)))
        .orderBy(desc(followUps.answeredAt))
        .limit(200),
    ),
    orEmpty(
      db
        .select({ id: bookings.id, serviceName: services.name, businessName: businesses.name, startsAt: bookings.startsAt, status: bookings.status })
        .from(bookings)
        .innerJoin(services, eq(services.id, bookings.serviceId))
        .innerJoin(businesses, eq(businesses.id, bookings.businessId))
        .where(eq(bookings.bookedByUserId, userId))
        .orderBy(desc(bookings.startsAt))
        .limit(200),
    ),
    orEmpty(
      db
        .select({ id: diagnosticSessions.id, query: diagnosticSessions.query, urgencyLevel: diagnosticSessions.urgencyLevel, createdAt: diagnosticSessions.createdAt })
        .from(diagnosticSessions)
        .where(eq(diagnosticSessions.userId, userId))
        .orderBy(desc(diagnosticSessions.createdAt))
        .limit(100),
    ),
    orEmpty(
      db
        .select({ id: wellbeingGapReports.id, generatedAt: wellbeingGapReports.generatedAt })
        .from(wellbeingGapReports)
        .where(eq(wellbeingGapReports.userId, userId))
        .orderBy(desc(wellbeingGapReports.generatedAt))
        .limit(100),
    ),
  ]);

  const labelled = cases.map((record) => ({ ...record, label: getDomainConfig(record.domain).label }));
  const answered: AnsweredCheckIn[] = checkIns.flatMap((row) =>
    row.answeredAt && (row.helped === "yes" || row.helped === "partly" || row.helped === "no") ? [{ ...row, answeredAt: row.answeredAt, helped: row.helped }] : [],
  );

  return {
    events: mergeTimeline(
      ...labelled.map((record) => caseEvents(record, record.label)),
      checkInEvents(answered),
      bookingEvents(bookingRows),
      symptomCheckEvents(symptomRows),
      nutritionReportEvents(reportRows),
    ),
    summary: clinicianSummary(labelled, answered),
  };
}
