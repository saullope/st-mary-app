"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { DEFAULT_VOICE_PROFILE, pickVoice, voicePitch, voiceRate, type VoiceProfile } from "./voiceProfile";

/**
 * Narración de los logros que gana el estudiante, con el perfil de voz que el
 * docente eligió en Configuración. También la usa la prueba de voz de ese ajuste.
 */
export function useGameVoice(enabled: boolean, profile: VoiceProfile = DEFAULT_VOICE_PROFILE) {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  // Las frases salen de messages en el idioma activo: la voz debe hablar ese idioma.
  const locale = useLocale();
  const lang = locale === "en" ? "en-US" : "es-MX";
  const { gender, speed } = profile;

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoice = () => {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices(), locale, gender);
    };
    loadVoice();
    // Chrome carga las voces de forma asíncrona.
    window.speechSynthesis.addEventListener("voiceschanged", loadVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoice);
  }, [locale, gender]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;
      // Una frase nueva corta la anterior para que no se encimen.
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = voiceRate(speed);
      utterance.pitch = voicePitch(gender);
      window.speechSynthesis.speak(utterance);
    },
    [enabled, lang, speed, gender]
  );

  return { speak };
}
