/**
 * Links expert-reviewed cases to marketplace bookings. A booking for a service whose kind names a
 * case domain (e.g. "reading" → spiritual) opens a case that the booked business reviews.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, businessMembers, businesses, serviceKinds, services } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { roleCan, type MemberRole } from "./roles";
import { notify } from "./notifications";
import { businessChannel, publish, userChannel } from "@/server/realtime";

export interface CaseBridge {
  /** Checks the booking can open a case in `domain` and returns the business that will review it. */
  resolveBookingForCase(user: AuthenticatedUser, bookingId: string, domain: string): Promise<{ businessId: string }>;
  linkBooking(bookingId: string, caseId: string): Promise<void>;
  canReviewForBusiness(userId: string, businessId: string): Promise<boolean>;
  onCaseEvent(event: CaseEvent): Promise<void>;
}

export interface CaseEvent {
  type: "submitted" | "claimed" | "approved";
  caseId: string;
  businessId: string;
  clientUserId: string;
  label: string;
}

async function reviewers(businessId: string) {
  const rows = await db.select({ userId: businessMembers.userId, role: businessMembers.role }).from(businessMembers).where(eq(businessMembers.businessId, businessId));
  return rows.filter((row) => roleCan(row.role as MemberRole, "reviewCases")).map((row) => row.userId);
}

export const caseBridge: CaseBridge = {
  async resolveBookingForCase(user, bookingId, domain) {
    const [row] = await db
      .select({ booking: bookings, caseDomain: serviceKinds.caseDomain, businessStatus: businesses.status })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
      .innerJoin(businesses, eq(businesses.id, bookings.businessId))
      .where(and(eq(bookings.id, bookingId), eq(bookings.bookedByUserId, user.id)))
      .limit(1);
    if (!row) throw ApiError.notFound("Booking");
    if (row.caseDomain !== domain) throw ApiError.badRequest("This booking is not for this type of case.");
    if (row.booking.caseId) throw ApiError.conflict("A case is already open for this booking.");
    if (!["requested", "confirmed", "completed"].includes(row.booking.status)) throw ApiError.conflict("This booking is no longer active.");
    return { businessId: row.booking.businessId };
  },

  async linkBooking(bookingId, caseId) {
    const [booking] = await db.update(bookings).set({ caseId, updatedAt: new Date() }).where(eq(bookings.id, bookingId)).returning({ businessId: bookings.businessId });
    if (booking) await publish(businessChannel(booking.businessId), "booking.case_linked", { bookingId, caseId });
  },

  async canReviewForBusiness(userId, businessId) {
    const [row] = await db
      .select({ role: businessMembers.role })
      .from(businessMembers)
      .where(and(eq(businessMembers.businessId, businessId), eq(businessMembers.userId, userId)))
      .limit(1);
    return Boolean(row && roleCan(row.role as MemberRole, "reviewCases"));
  },

  async onCaseEvent(event) {
    const href = `/business/${event.businessId}/cases/${event.caseId}`;
    if (event.type === "submitted") {
      for (const userId of await reviewers(event.businessId)) {
        await notify(userId, { type: "case.submitted", title: `New ${event.label} case to review`, body: "The client has completed their intake.", href });
      }
    }
    if (event.type === "approved") {
      await notify(event.clientUserId, { type: "case.approved", title: "Your report is ready", body: `Your ${event.label} report has been reviewed and approved.`, href: `/case/workflows/${event.caseId}` });
    }
    await publish([businessChannel(event.businessId), userChannel(event.clientUserId)], `case.${event.type}`, { caseId: event.caseId });
  },
};
