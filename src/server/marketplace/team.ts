/** Business team: members, invitations and the rules that govern them. */
import crypto from "node:crypto";
import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { businessInvitations, businessMembers, businesses, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability } from "./access";
import { notify } from "./notifications";
import { businessChannel, publish, userChannel } from "@/server/realtime";
import { insertReturning, keepExisting, updateReturning } from "@/lib/db/write";

export const ASSIGNABLE_ROLES = ["manager", "practitioner", "staff"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
const INVITE_TTL_DAYS = 14;

// ── Pure rules ───────────────────────────────────────────────────────────────

export type TeamAction =
  | { kind: "update"; actorId: string; target: { userId: string; role: string } }
  | { kind: "remove"; actorId: string; actorRole: string; target: { userId: string; role: string } };

/** Returns an error message when the action is not allowed, otherwise null. */
export function teamActionError(action: TeamAction): string | null {
  if (action.target.role === "owner") {
    return action.kind === "remove" ? "The owner cannot be removed from the business." : "The owner's role cannot be changed.";
  }
  if (action.kind === "remove" && action.actorId === action.target.userId) return null; // leaving
  if (action.kind === "remove" && action.actorRole !== "owner") return "Only the owner can remove team members.";
  return null;
}

export const digestToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

// ── Schemas ──────────────────────────────────────────────────────────────────

export const inviteInput = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(ASSIGNABLE_ROLES),
  title: z.string().trim().max(120).optional(),
  isBookable: z.boolean().default(false),
});

export const memberUpdate = z.object({
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  title: z.string().trim().max(120).nullable().optional(),
  isBookable: z.boolean().optional(),
});

// ── Team ─────────────────────────────────────────────────────────────────────

export async function getTeam(user: AuthenticatedUser, businessId: string) {
  const membership = await requireCapability(user, businessId, "view");
  const [members, invitations] = await Promise.all([
    db
      .select({ id: businessMembers.id, userId: businessMembers.userId, role: businessMembers.role, title: businessMembers.title, isBookable: businessMembers.isBookable, name: users.name, email: users.email, joinedAt: businessMembers.createdAt })
      .from(businessMembers)
      .innerJoin(users, eq(users.id, businessMembers.userId))
      .where(eq(businessMembers.businessId, businessId))
      .orderBy(sql`case ${businessMembers.role} when 'owner' then 0 when 'manager' then 1 when 'practitioner' then 2 else 3 end`, asc(users.name)),
    membership.role === "owner"
      ? db
          .select({ id: businessInvitations.id, email: businessInvitations.email, role: businessInvitations.role, title: businessInvitations.title, isBookable: businessInvitations.isBookable, expiresAt: businessInvitations.expiresAt, createdAt: businessInvitations.createdAt })
          .from(businessInvitations)
          .where(and(eq(businessInvitations.businessId, businessId), isNull(businessInvitations.acceptedAt), isNull(businessInvitations.revokedAt), gt(businessInvitations.expiresAt, new Date())))
          .orderBy(desc(businessInvitations.createdAt))
      : Promise.resolve([]),
  ]);
  return { members, invitations, myRole: membership.role, myUserId: user.id };
}

/** Creates an invitation and returns the one-time link. Existing accounts also get an in-app notice. */
export async function inviteMember(user: AuthenticatedUser, businessId: string, raw: z.infer<typeof inviteInput>, origin: string) {
  await requireCapability(user, businessId, "manageTeam");
  // Normalise here too: callers other than the route must not bypass it.
  const input = { ...raw, email: raw.email.trim().toLowerCase() };
  const [business] = await db.select({ name: businesses.name }).from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!business) throw ApiError.notFound("Business");

  const [existingMember] = await db
    .select({ id: businessMembers.id })
    .from(businessMembers)
    .innerJoin(users, eq(users.id, businessMembers.userId))
    .where(and(eq(businessMembers.businessId, businessId), sql`lower(${users.email}) = ${input.email}`))
    .limit(1);
  if (existingMember) throw ApiError.conflict("This person is already on your team.");

  const token = crypto.randomBytes(32).toString("base64url");
  const link = `${origin}/invitations/${token}`;

  const invitation = await db.transaction(async (tx) => {
    // A new invitation replaces any pending one for the same email.
    await tx
      .update(businessInvitations)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(businessInvitations.businessId, businessId), eq(businessInvitations.email, input.email), isNull(businessInvitations.acceptedAt), isNull(businessInvitations.revokedAt)));
    const [row] = await insertReturning(tx, businessInvitations, { ...input, businessId, tokenHash: digestToken(token), invitedBy: user.id, expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000) });
    const [invitee] = await tx.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${input.email}`).limit(1);
    if (invitee) {
      await notify(invitee.id, { type: "team.invited", title: `You're invited to join ${business.name}`, body: `As ${input.role}. The invitation expires in ${INVITE_TTL_DAYS} days.`, href: `/invitations/${token}` }, tx);
    }
    await publish(businessChannel(businessId), "team.updated", {}, tx);
    return row;
  });

  return { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt, link };
}

export async function revokeInvitation(user: AuthenticatedUser, businessId: string, invitationId: string) {
  await requireCapability(user, businessId, "manageTeam");
  const [row] = await updateReturning(db, businessInvitations, { revokedAt: new Date(), updatedAt: new Date() }, and(eq(businessInvitations.id, invitationId), eq(businessInvitations.businessId, businessId), isNull(businessInvitations.acceptedAt)), { id: businessInvitations.id });
  if (!row) throw ApiError.notFound("Invitation");
  await publish(businessChannel(businessId), "team.updated", {});
  return row;
}

async function memberRow(businessId: string, memberId: string) {
  const [row] = await db.select().from(businessMembers).where(and(eq(businessMembers.id, memberId), eq(businessMembers.businessId, businessId))).limit(1);
  if (!row) throw ApiError.notFound("Team member");
  return row;
}

export async function updateMember(user: AuthenticatedUser, businessId: string, memberId: string, input: z.infer<typeof memberUpdate>) {
  await requireCapability(user, businessId, "manageTeam");
  const target = await memberRow(businessId, memberId);
  // Title and bookability may change for anyone, including the owner; the role may not.
  if (input.role) {
    const error = teamActionError({ kind: "update", actorId: user.id, target });
    if (error) throw ApiError.forbidden(error);
  }
  const [updated] = await updateReturning(db, businessMembers, { ...(input.role ? { role: input.role } : {}), ...(input.title !== undefined ? { title: input.title } : {}), ...(input.isBookable !== undefined ? { isBookable: input.isBookable } : {}), updatedAt: new Date() }, eq(businessMembers.id, memberId));
  await publish([businessChannel(businessId), userChannel(target.userId)], "team.updated", { memberId });
  return updated;
}

export async function removeMember(user: AuthenticatedUser, businessId: string, memberId: string) {
  const actor = await requireCapability(user, businessId, "view");
  const target = await memberRow(businessId, memberId);
  const error = teamActionError({ kind: "remove", actorId: user.id, actorRole: actor.role, target });
  if (error) throw ApiError.forbidden(error);
  await db.delete(businessMembers).where(eq(businessMembers.id, memberId));
  await publish([businessChannel(businessId), userChannel(target.userId)], "team.updated", { memberId, removed: true });
  return { removed: memberId, left: target.userId === user.id };
}

// ── Accepting ────────────────────────────────────────────────────────────────

async function findInvitation(token: string) {
  const [row] = await db
    .select({ invitation: businessInvitations, businessName: businesses.name, businessSlug: businesses.slug })
    .from(businessInvitations)
    .innerJoin(businesses, eq(businesses.id, businessInvitations.businessId))
    .where(eq(businessInvitations.tokenHash, digestToken(token)))
    .limit(1);
  if (!row) throw ApiError.notFound("Invitation");
  const { invitation } = row;
  const state = invitation.acceptedAt ? "accepted" : invitation.revokedAt ? "revoked" : invitation.expiresAt <= new Date() ? "expired" : "pending";
  return { ...row, state };
}

/** What the invitation page shows. The email is partly masked for anyone other than its owner. */
export async function previewInvitation(user: AuthenticatedUser, token: string) {
  const { invitation, businessName, state } = await findInvitation(token);
  const mine = user.email.toLowerCase() === invitation.email;
  const [local, domain] = invitation.email.split("@");
  return {
    businessName,
    businessId: invitation.businessId,
    role: invitation.role,
    title: invitation.title,
    state,
    email: mine ? invitation.email : `${local.slice(0, 2)}…@${domain}`,
    matchesAccount: mine,
  };
}

export async function acceptInvitation(user: AuthenticatedUser, token: string) {
  const { invitation, businessName, state } = await findInvitation(token);
  if (state !== "pending") throw ApiError.conflict(`This invitation has been ${state}. Ask the business owner for a new one.`);
  if (user.email.toLowerCase() !== invitation.email) {
    throw ApiError.forbidden(`This invitation is for ${invitation.email}. Sign in with that account to accept it.`);
  }
  await db.transaction(async (tx) => {
    await tx
      .insert(businessMembers)
      .values({ businessId: invitation.businessId, userId: user.id, role: invitation.role, title: invitation.title, isBookable: invitation.isBookable })
      .onDuplicateKeyUpdate({ set: keepExisting(businessMembers) });
    await tx.update(businessInvitations).set({ acceptedAt: new Date(), acceptedBy: user.id, updatedAt: new Date() }).where(eq(businessInvitations.id, invitation.id));
    if (invitation.invitedBy) {
      await notify(invitation.invitedBy, { type: "team.joined", title: `${user.name ?? user.email} joined ${businessName}`, body: `As ${invitation.role}.`, href: `/business/${invitation.businessId}/team` }, tx);
    }
    await publish(businessChannel(invitation.businessId), "team.updated", {}, tx);
  });
  return { businessId: invitation.businessId, businessName };
}
