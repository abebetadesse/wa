import type { Metadata } from "next";
import EmergencyClient from "./EmergencyClient";

export const metadata: Metadata = {
  title: "Emergency health Profile | Ethiopian Wisdom Platform",
  description:
    "Set up your emergency health profile — contacts, conditions, medications, and blood type — so first responders can act quickly in a health emergency.",
};

export default function EmergencyPage() {
  return <EmergencyClient />;
}
