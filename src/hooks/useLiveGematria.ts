"use client";

import { useState, useEffect, useRef } from "react";
import {
  FullDivinationResult,
  calculateFullDivination,
  ZodiacSign,
  AwdeCircle,
  AwdeSegment,
  TalismanicCharacter,
  GematriaLetter,
} from "@/lib/cultural/spiritualDivinationEngine";

export interface LiveGematriaState {
  nameGeez: string;
  motherNameGeez: string;
  isValid: boolean;
  letters: GematriaLetter[];
  motherLetters: GematriaLetter[];
  nameSubtotal: number;
  motherSubtotal: number;
  totalSum: number;
  dividedBy12: number;
  finalNumber: number;
  zodiac: ZodiacSign | null;
  awdeCircle: AwdeCircle | null;
  awdeSegment: AwdeSegment | null;
  talismanic: TalismanicCharacter | null;
  scriptDetected: boolean;
  isCalculating: boolean;
  error: string | null;
}

export function useLiveGematria(nameGeez: string = "", motherNameGeez: string = ""): LiveGematriaState {
  const [state, setState] = useState<LiveGematriaState>(() => {
    if (!nameGeez.trim()) {
      return {
        nameGeez: "",
        motherNameGeez: "",
        isValid: false,
        letters: [],
        motherLetters: [],
        nameSubtotal: 0,
        motherSubtotal: 0,
        totalSum: 0,
        dividedBy12: 0,
        finalNumber: 0,
        zodiac: null,
        awdeCircle: null,
        awdeSegment: null,
        talismanic: null,
        scriptDetected: false,
        isCalculating: false,
        error: null,
      };
    }
    try {
      const res = calculateFullDivination(nameGeez, motherNameGeez);
      return {
        ...res,
        isCalculating: false,
        error: null,
      };
    } catch {
      return {
        nameGeez,
        motherNameGeez,
        isValid: false,
        letters: [],
        motherLetters: [],
        nameSubtotal: 0,
        motherSubtotal: 0,
        totalSum: 0,
        dividedBy12: 0,
        finalNumber: 0,
        zodiac: null,
        awdeCircle: null,
        awdeSegment: null,
        talismanic: null,
        scriptDetected: false,
        isCalculating: false,
        error: "Calculation error",
      };
    }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!nameGeez.trim()) {
      setState({
        nameGeez: "",
        motherNameGeez: "",
        isValid: false,
        letters: [],
        motherLetters: [],
        nameSubtotal: 0,
        motherSubtotal: 0,
        totalSum: 0,
        dividedBy12: 0,
        finalNumber: 0,
        zodiac: null,
        awdeCircle: null,
        awdeSegment: null,
        talismanic: null,
        scriptDetected: false,
        isCalculating: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, isCalculating: true }));

    timerRef.current = setTimeout(() => {
      try {
        const result = calculateFullDivination(nameGeez, motherNameGeez);
        setState({
          ...result,
          isCalculating: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isValid: false,
          error: err instanceof Error ? err.message : "Calculation error",
          isCalculating: false,
        }));
      }
    }, 120);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nameGeez, motherNameGeez]);

  return state;
}
