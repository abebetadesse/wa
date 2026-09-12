"use client";

import { useState, useCallback, useRef } from "react";

export function useGeezVoiceInput(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "am-ET"; // Amharic (Ethiopia)
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setError(event.error || "Speech recognition encountered an error.");
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setTranscript(text);
        if (onResult) onResult(text);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setError(err instanceof Error ? err.message : "Failed to initialize microphone.");
    }
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, transcript, error, startListening, stopListening };
}
