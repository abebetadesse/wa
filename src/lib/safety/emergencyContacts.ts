/**
 * The only place emergency phone numbers come from.
 *
 * No number is shown until someone has confirmed it with the operating organisation. Until then
 * every screen shows generic guidance instead. To add numbers, an administrator enters them under
 * Admin → Emergency numbers (stored in platform settings as "emergencyContacts"), or a verified
 * number can be added to VERIFIED_EMERGENCY_CONTACTS below with the date it was checked.
 *
 * Pure and client-safe. On the server the administrator's list is loaded into this module by
 * `getSettings("emergencyContacts")`; in the browser `useEmergencyContacts()` fetches it.
 */

export interface EmergencyContact {
  name: string;
  number: string;
  /** ISO date the number was confirmed with the service. */
  verifiedOn?: string | null;
}

/** Numbers confirmed in code review. Empty on purpose: add an entry only with a verification date. */
export const VERIFIED_EMERGENCY_CONTACTS: readonly EmergencyContact[] = [];

export const EMERGENCY_GUIDANCE = "Contact local emergency services or go to the nearest health facility now.";
export const EMERGENCY_GUIDANCE_AMHARIC = "በአካባቢዎ ያለውን የድንገተኛ አደጋ አገልግሎት ያግኙ ወይም አሁኑኑ ወደ ቅርብ ጤና ተቋም ይሂዱ።";

let configured: EmergencyContact[] = [];

/** Replaces the administrator-entered list (called when settings are read). Invalid rows are dropped. */
export function setConfiguredEmergencyContacts(contacts: readonly EmergencyContact[] | null | undefined): void {
  configured = (contacts ?? [])
    .filter((contact) => contact && contact.name?.trim() && contact.number?.trim())
    .map((contact) => ({ name: contact.name.trim(), number: contact.number.trim(), verifiedOn: contact.verifiedOn ?? null }));
}

/** Every verified number, code list first, without duplicates. Empty until numbers are verified. */
export function verifiedEmergencyContacts(extra: readonly EmergencyContact[] = []): EmergencyContact[] {
  const seen = new Set<string>();
  return [...VERIFIED_EMERGENCY_CONTACTS, ...configured, ...extra].filter((contact) => {
    const key = contact.number.replace(/[^\d+]/g, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Verified numbers as `{ name, number }` hotline entries; empty while none are verified. */
export function verifiedHotlines(): { name: string; number: string }[] {
  return verifiedEmergencyContacts().map(({ name, number }) => ({ name, number }));
}

/** One plain sentence telling the person what to do now, naming verified numbers when there are any. */
export function emergencyStep(contacts: readonly EmergencyContact[] = verifiedEmergencyContacts()): string {
  if (contacts.length === 0) return EMERGENCY_GUIDANCE;
  return `${EMERGENCY_GUIDANCE} Verified numbers: ${contacts.map((contact) => `${contact.name} ${contact.number}`).join("; ")}.`;
}

/** Amharic counterpart of `emergencyStep`. */
export function emergencyStepAmharic(contacts: readonly EmergencyContact[] = verifiedEmergencyContacts()): string {
  if (contacts.length === 0) return EMERGENCY_GUIDANCE_AMHARIC;
  return `${EMERGENCY_GUIDANCE_AMHARIC} የተረጋገጡ ቁጥሮች፦ ${contacts.map((contact) => `${contact.name} ${contact.number}`).join("፤ ")}።`;
}
