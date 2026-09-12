"use client";

import { useState, useEffect } from "react";
import { SpiritualCaseStatus, Expert } from "@/lib/case-workflow/spiritualExpertEngine";

export function useCaseStatusStream(caseId: string) {
  const [status, setStatus] = useState<SpiritualCaseStatus | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [expert, setExpert] = useState<Expert | null>(null);
  const [reportReady, setReportReady] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    let isMounted = true;
    let eventSource: EventSource | null = null;

    // 1. Initial fetch
    fetch(`/api/case/spiritual/${caseId}/status`)
      .then((res) => res.json())
      .then((payload) => {
        if (isMounted && payload.success && payload.data) {
          setStatus(payload.data.status);
          setEta(payload.data.estimatedMinutesRemaining);
          if (payload.data.assignedExpert) setExpert(payload.data.assignedExpert);
          if (payload.data.status === "visible_to_user" || payload.data.status === "full_report_released") {
            setReportReady(true);
          }
        }
      })
      .catch(() => {});

    // 2. Server-Sent Events stream
    try {
      eventSource = new EventSource(`/api/case/spiritual/${caseId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!isMounted) return;

          switch (data.type) {
            case "status_update":
              setStatus(data.status);
              if (data.status === "visible_to_user" || data.status === "full_report_released") {
                setReportReady(true);
              }
              break;
            case "eta_update":
              setEta(data.estimatedMinutesRemaining);
              break;
            case "expert_assigned":
              setExpert(data.expert);
              break;
            case "report_ready":
              setStatus("visible_to_user");
              setReportReady(true);
              break;
          }
        } catch {
          // Silent JSON parse fallback
        }
      };

      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
      };
    } catch {
      // EventSource fallback
    }

    // 3. Periodic fallback poll (every 5 seconds) in case SSE is blocked
    const interval = setInterval(() => {
      fetch(`/api/case/spiritual/${caseId}/status`)
        .then((r) => r.json())
        .then((res) => {
          if (isMounted && res.success && res.data) {
            setStatus(res.data.status);
            setEta(res.data.estimatedMinutesRemaining);
            if (res.data.assignedExpert) setExpert(res.data.assignedExpert);
            if (res.data.status === "visible_to_user" || res.data.status === "full_report_released") {
              setReportReady(true);
            }
          }
        })
        .catch(() => {});
    }, 5000);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [caseId]);

  return { status, eta, expert, reportReady };
}
