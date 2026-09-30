"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/features/session/SessionProvider";
import { useExplore } from "./useExplore";

/**
 * Records when someone who works in a business opens a toolkit tool, whether they came from the
 * toolkit, the Explore menu or a link. These visits drive each business's recommendations and
 * connected knowledge strands. Nothing is sent for clients or for pages that aren't tools.
 */
export function ToolUsageTracker() {
  const pathname = usePathname();
  const { user } = useSession();
  const explore = useExplore();

  useEffect(() => {
    if (!user || !explore?.isPractitioner || !pathname) return;
    const isTool = explore.groups.some((group) => group.tools.some((tool) => {
      const path = tool.href.split("?")[0];
      return path.startsWith("/") && (pathname === path || pathname.startsWith(`${path}/`));
    }));
    if (!isTool) return;
    const businessId = new URLSearchParams(window.location.search).get("toolkit") ?? undefined;
    const timer = setTimeout(() => {
      void fetch("/api/toolkit/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        keepalive: true,
        body: JSON.stringify({ path: pathname, businessId }),
      }).catch(() => null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [pathname, user, explore]);

  return null;
}
