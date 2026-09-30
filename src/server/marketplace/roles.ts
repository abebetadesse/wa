/** Workspace roles and capabilities. Pure (no server imports) so the UI can mirror the rules. */

export const MEMBER_ROLES = ["owner", "manager", "practitioner", "staff"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Capabilities per role. Owners and managers run the business; practitioners serve clients. */
export const CAPABILITIES = {
  view: ["owner", "manager", "practitioner", "staff"],
  manageBookings: ["owner", "manager", "practitioner", "staff"],
  manageClients: ["owner", "manager", "practitioner"],
  viewClientNotes: ["owner", "manager", "practitioner"],
  manageServices: ["owner", "manager"],
  manageSchedule: ["owner", "manager"],
  manageInventory: ["owner", "manager", "practitioner"],
  recordPayments: ["owner", "manager", "staff"],
  voidPayments: ["owner", "manager"],
  viewFinance: ["owner", "manager"],
  manageProfile: ["owner", "manager"],
  manageTeam: ["owner"],
  respondReviews: ["owner", "manager"],
  message: ["owner", "manager", "practitioner", "staff"],
  /** Review and approve expert-reviewed cases opened from this business's bookings. */
  reviewCases: ["owner", "manager", "practitioner"],
  /** Choose the tools and knowledge sets in the business toolkit. */
  manageToolkit: ["owner", "manager", "practitioner"],
} as const satisfies Record<string, readonly MemberRole[]>;

export type Capability = keyof typeof CAPABILITIES;

export function roleCan(role: MemberRole, capability: Capability) {
  return (CAPABILITIES[capability] as readonly MemberRole[]).includes(role);
}
