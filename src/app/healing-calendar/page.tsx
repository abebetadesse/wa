import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/ui";
import { HealingTimingPlanner } from "@/features/timing/HealingTimingPlanner";

export const metadata: Metadata = {
  title: "Healing calendar | Sun, Moon, weather and remedy timing",
  description:
    "Sunrise, sunset, moon phase, planetary hours, the Ethiopian date and clock, fasts and saints' days and the weather forecast, matched to the timing traditions of Ethiopian healers.",
};

export default function HealingCalendarPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Healing calendar"
        title="Sun, Moon & weather timing"
        description="Match a remedy, prayer or gathering to the right day and hour: the Moon's phase and sign, the planetary hour, the Ethiopian calendar and the local forecast."
      />
      <HealingTimingPlanner />
    </PageShell>
  );
}
