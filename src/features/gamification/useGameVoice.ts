"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLocale } from "next-intl";

/**
 * Síntesis de voz compartida por el panel de configuración (preview de
 * frases al seleccionar) y GameEngine (narrar logros durante el juego).
 * Extraído de GamificationPanel.tsx para no duplicar la selección de voz.
 */
export function useGameVoice(enabled: boolean) {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  // Las frases salen de messages en el idioma activo: la voz debe hablar ese idioma.
  const locale = useLocale();
  const lang = locale === "en" ? "en-US" : "es-MX";

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const sameLanguage = voices.filter((v) => v.lang.toLowerCase().startsWith(locale === "en" ? "en" : "es"));
      voiceRef.current =
        (locale === "en" ? null : sameLanguage.find((v) => v.name.includes("Sofía") || v.name.includes("Sofia"))) ||
        sameLanguage.find((v) => v.lang.replace("_", "-") === lang) ||
        sameLanguage[0] ||
        null;
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
  }, [locale, lang]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

      // Cancelar cualquier audio previo para evitar superposiciones
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
      }
      window.speechSynthesis.speak(utterance);
    },
    [enabled, lang]
  );

  return { speak };
}
