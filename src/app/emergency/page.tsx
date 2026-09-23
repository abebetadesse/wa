import type { Metadata } from "next";
import EmergencyClient from "./EmergencyClient";

export const metadata: Metadata = {
  title: "Emergency Wellbeing Profile | Ethiopian Wisdom Platform",
  description:
    "Set up your emergency wellbeing profile — contacts, conditions, medications, and blood type — so first responders can act quickly in a wellbeing emergency.",
};

export default function EmergencyPage() {
  return <EmergencyClient />;
}
