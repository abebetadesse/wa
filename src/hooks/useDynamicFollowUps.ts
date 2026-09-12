"use client";

import { useState, useEffect, useRef } from "react";
import { DynamicQuestion } from "@/lib/case-workflow/spiritualQuestionEngine";

export function useDynamicFollowUps(
  currentQuestionId: string,
  userText: string,
  gematriaContext: Record<string, any>,
  priorAnswers: Record<string, any>
) {
  const [followUps, setFollowUps] = useState<DynamicQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [crisisFlag, setCrisisFlag] = useState(false);

  // Keep references to volatile object parameters so they don't trigger the effect on every re-render
  const gematriaRef = useRef(gematriaContext);
  gematriaRef.current = gematriaContext;

  const answersRef = useRef(priorAnswers);
  answersRef.current = priorAnswers;

  useEffect(() => {
    // If text is empty or too short, reset follow-ups only if we currently have any
    if (!userText || userText.trim().length < 20) {
      setFollowUps((prev) => (prev.length === 0 ? prev : []));
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const currentGem = gematriaRef.current || {};
        const response = await fetch("/api/case/spiritual/follow-ups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentQuestionId,
            userText,
            gematriaContext: {
              nameGeez: currentGem.nameGeez,
              zodiac: currentGem.zodiac?.name,
              awdeCircle: currentGem.awdeCircle?.name,
              talismanic: currentGem.talismanic?.name,
            },
            priorAnswers: answersRef.current || {},
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          setFollowUps(data.data.questions || []);
          if (data.data.crisis_flag) {
            setCrisisFlag(true);
          }
        }
      } catch {
        // Non-blocking fallback
      } finally {
        setIsLoading(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentQuestionId, userText]);

  return { followUps, isLoading, crisisFlag };
}
