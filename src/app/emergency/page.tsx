import type { Metadata } from "next";
import EmergencyClient from "./EmergencyClient";

export const metadata: Metadata = {
  title: "Emergency Welbeing Profile | Ethiopian Wisdom Platform",
  description:
    "Set up your emergency Welbeing profile — contacts, conditions, medications, and blood type — so first responders can act quickly in a Welbeing emergency.",
};

export default function EmergencyPage() {
  return <EmergencyClient />;
}
