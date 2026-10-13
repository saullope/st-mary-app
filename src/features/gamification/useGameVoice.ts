"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Síntesis de voz compartida por el panel de configuración (preview de
 * frases al seleccionar) y GameEngine (narrar logros durante el juego).
 * Extraído de GamificationPanel.tsx para no duplicar la selección de voz.
 */
export function useGameVoice(enabled: boolean) {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.name.includes("Sofía") || v.name.includes("Sofia")) ||
        voices.find((v) => /es(-|_)US|es(-|_)MX/.test(v.lang)) ||
        voices[0] ||
        null;
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

      // Cancelar cualquier audio previo para evitar superposiciones
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
      }
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  return { speak };
}
