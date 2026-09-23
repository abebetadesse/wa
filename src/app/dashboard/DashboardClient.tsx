"use client";

import dynamic from "next/dynamic";

const HudDashboard = dynamic(() => import("@/components/dashboard/HudDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="glass-panel max-w-md p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-cyan-500/40" />
        <div className="mt-4 h-4 w-36 mx-auto animate-pulse rounded bg-white/10" />
      </div>
    </div>
  ),
});

export default function DashboardClient() {
  return <HudDashboard />;
}
