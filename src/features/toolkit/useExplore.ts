"use client";

import { useEffect, useState } from "react";
import { AUTH_STATE_CHANGED } from "@/lib/auth/clientEvents";

export interface ExploreTool {
  key: string;
  name: string;
  description: string;
  group: string;
  href: string;
  audience: string;
}

export interface ExploreData {
  groups: { group: string; label: string; tools: ExploreTool[] }[];
  culturalVisible: boolean;
  isPractitioner: boolean;
}

let cache: Promise<ExploreData | null> | null = null;

function load(force = false) {
  if (force || !cache) {
    cache = fetch("/api/toolkit/explore", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((payload) => (payload?.success ? (payload.data as ExploreData) : null))
      .catch(() => null);
  }
  return cache;
}

/**
 * Tools the current viewer may open (visitors: public; people working in a business: practitioner
 * tools too; administrators: everything), managed by administrators in the toolkit. Shared by the
 * navigation bar and footer, refreshed when the person signs in or out.
 */
export function useExplore() {
  const [data, setData] = useState<ExploreData | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = (force: boolean) => load(force).then((result) => active && setData(result));
    void refresh(false);
    const onAuth = () => void refresh(true);
    window.addEventListener(AUTH_STATE_CHANGED, onAuth);
    return () => {
      active = false;
      window.removeEventListener(AUTH_STATE_CHANGED, onAuth);
    };
  }, []);
  return data;
}
