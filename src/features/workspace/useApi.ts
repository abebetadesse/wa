"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { useRealtime } from "@/features/realtime/RealtimeProvider";

/**
 * Loads `url` and reloads it when a matching realtime event arrives (debounced), so every
 * workspace screen stays current without manual refresh.
 */
export function useApi<T>(url: string | null, options: { liveTypes?: string[] } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      setData(await apiFetch<T>(url));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtime(options.liveTypes ?? null, () => {
    if (!options.liveTypes) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(reload, 250);
  });

  return { data, setData, error, loading, reload };
}
