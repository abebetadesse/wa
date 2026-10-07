"use client";

import { useState, useCallback, useRef } from "react";

export function useGeezVoiceInput(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consentPending, setConsentPending] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const recognitionRef = useRef<any>(null);

  const beginListening = useCallback(() => {
    setError(null);
    setTranscript("");
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

  const startListening = useCallback(() => {
    if (!consentGranted) {
      setConsentPending(true);
      return;
    }
    beginListening();
  }, [beginListening, consentGranted]);

  const acceptVoiceConsent = useCallback(() => {
    setConsentGranted(true);
    setConsentPending(false);
    beginListening();
  }, [beginListening]);

  const declineVoiceConsent = useCallback(() => setConsentPending(false), []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  return {
    isListening,
    transcript,
    error,
    consentPending,
    startListening,
    stopListening,
    acceptVoiceConsent,
    declineVoiceConsent,
    clearTranscript,
  };
}
