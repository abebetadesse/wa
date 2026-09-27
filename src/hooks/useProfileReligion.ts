"use client";

import { useEffect, useState } from "react";
import { matchReligion, type ChristianTradition } from "@/lib/christian/religionMatch";
import { getClientUser } from "@/lib/auth/clientState";

export function useProfileReligion() {
  const [state, setState] = useState({ loading: true, error: false, rawReligion: "", isChristian: false, tradition: "unspecified" as ChristianTradition });
  useEffect(() => {
    const controller = new AbortController();
    getClientUser()
      .then(async (user) => {
        if (controller.signal.aborted) return;
        if (!user) {
          setState({ loading: false, error: false, rawReligion: "", isChristian: false, tradition: "unspecified" });
          return;
        }

        const response = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Profile request failed");
        const payload = await response.json() as { data?: Record<string, unknown> };
        const data = payload.data ?? {};
        const raw = ["religion", "Religion", "Religious affiliation", "Faith tradition", "faith"]
          .map((key) => data[key]).find(Boolean);
        const match = matchReligion(raw);
        setState({ loading: false, error: false, rawReligion: match.raw, isChristian: match.isChristian, tradition: match.tradition });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState((current) => ({ ...current, loading: false, error: true }));
      });
    return () => controller.abort();
  }, []);
  return state;
}
