"use client";

/**
 * Emergency guidance shown on every crisis and emergency screen. Numbers come only from
 * src/lib/safety/emergencyContacts.ts and the administrator's verified list; while there are none,
 * it shows generic guidance instead of a number.
 */
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMERGENCY_GUIDANCE, verifiedEmergencyContacts, type EmergencyContact } from "@/lib/safety/emergencyContacts";

let pending: Promise<EmergencyContact[]> | null = null;

function loadVerified(): Promise<EmergencyContact[]> {
  pending ??= fetch("/api/platform/settings", { credentials: "same-origin" })
    .then((response) => response.json())
    .then((payload) => (Array.isArray(payload?.data?.emergencyContacts) ? (payload.data.emergencyContacts as EmergencyContact[]) : []))
    .catch(() => {
      pending = null;
      return [];
    });
  return pending;
}

/** Verified emergency numbers: the code list, the administrator's list, and any passed in. */
export function useEmergencyContacts(extra: readonly EmergencyContact[] = []): EmergencyContact[] {
  const [loaded, setLoaded] = useState<EmergencyContact[]>([]);
  useEffect(() => {
    let live = true;
    loadVerified().then((contacts) => live && setLoaded(contacts));
    return () => {
      live = false;
    };
  }, []);
  return verifiedEmergencyContacts([...loaded, ...extra]);
}

export function EmergencyHelp({
  contacts = [],
  tone = "default",
  showGuidance = true,
  className,
}: {
  /** Numbers carried by a server response; they must already be verified. */
  contacts?: readonly EmergencyContact[];
  tone?: "default" | "dark";
  /** Show the generic guidance sentence. Turn off where the screen already shows it as a step. */
  showGuidance?: boolean;
  className?: string;
}) {
  const verified = useEmergencyContacts(contacts);
  const dark = tone === "dark";
  // Without guidance (the screen already says what to do) there is nothing to add until a number is verified.
  if (!showGuidance && verified.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showGuidance && (
        <p className={cn("text-sm font-semibold", dark ? "text-rose-100" : "text-foreground")}>{EMERGENCY_GUIDANCE}</p>
      )}
      {verified.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {verified.map((contact) => (
            <li key={contact.number}>
              <a
                href={`tel:${contact.number.replace(/[^\d+]/g, "")}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  dark ? "border-rose-400/40 bg-black/40 text-white hover:bg-rose-900/50" : "border-border bg-card hover:border-input",
                )}
              >
                <Phone className={cn("size-4", dark ? "text-rose-300" : "text-brand")} aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="font-semibold" translate="no">{contact.number}</span>
                  <span className={cn("text-xs", dark ? "text-rose-200" : "text-muted-foreground")}>{contact.name}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
