"use client";

import { useState, useEffect } from "react";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export function usePaymentStream(caseId: string, purchaseId?: string) {
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/case/spiritual/${caseId}/status`);
        const payload = await response.json();
        if (isMounted && payload.success && payload.data) {
          if (payload.data.paymentConfirmed || payload.data.status === "full_report_released") {
            setStatus("completed");
            clearInterval(interval);
          }
        }
      } catch {
        // Continue polling
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [caseId, purchaseId]);

  return { status, setStatus, error, setError };
}
