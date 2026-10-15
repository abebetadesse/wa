"use client";

import { PageHeader } from "@/components/ui";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { HealingTimingPlanner } from "@/features/timing/HealingTimingPlanner";

export default function WorkspaceTimingPage() {
  const { business } = useWorkspace();
  return (
    <div>
      <PageHeader
        title="Healing calendar"
        description="Plan remedies, prayers and gathering by the Sun, the Moon, the Ethiopian calendar and the local forecast."
      />
      <HealingTimingPlanner defaultPlace={business.city || business.region} />
    </div>
  );
}
