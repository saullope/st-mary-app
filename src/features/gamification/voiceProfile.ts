// Voz que narra los logros al estudiante. El docente elige un perfil en
// Configuración > Preferencias; cada navegador trae voces distintas, así que el
// perfil se traduce a la voz instalada más parecida en el equipo del estudiante.

export const VOICE_GENDERS = ["female", "male"] as const;
export type VoiceGender = (typeof VOICE_GENDERS)[number];

export const VOICE_SPEEDS = ["slow", "normal", "fast"] as const;
export type VoiceSpeed = (typeof VOICE_SPEEDS)[number];

export interface VoiceProfile {
  gender: VoiceGender;
  speed: VoiceSpeed;
}

export const DEFAULT_VOICE_PROFILE: VoiceProfile = { gender: "female", speed: "normal" };

/** Más lenta que la del navegador por defecto: la escuchan niños de primer a tercer grado. */
const RATES: Record<VoiceSpeed, number> = { slow: 0.8, normal: 0.95, fast: 1.1 };
/** El tono ayuda a distinguir el perfil cuando el equipo no tiene una voz de ese género. */
const PITCHES: Record<VoiceGender, number> = { female: 1.15, male: 0.95 };

export const voiceRate = (speed: VoiceSpeed) => RATES[speed];
export const voicePitch = (gender: VoiceGender) => PITCHES[gender];

/** Normaliza lo que llega de la BD o del cliente; un valor desconocido vuelve al perfil por defecto. */
export function toVoiceProfile(gender: unknown, speed: unknown): VoiceProfile {
  return {
    gender: (VOICE_GENDERS as readonly unknown[]).includes(gender) ? (gender as VoiceGender) : DEFAULT_VOICE_PROFILE.gender,
    speed: (VOICE_SPEEDS as readonly unknown[]).includes(speed) ? (speed as VoiceSpeed) : DEFAULT_VOICE_PROFILE.speed,
  };
}

// La Web Speech API no informa el género: se deduce del nombre de las voces más comunes
// de Windows, macOS, Edge, Chrome y Android.
const FEMALE_NAMES = /sof[ií]a|paulina|helena|laura|sabina|m[oó]nica|elvira|dalia|camila|paloma|marisol|lupe|valentina|ximena|zira|samantha|susan|aria|jenny|michelle|emma|ava|female|mujer/i;
const MALE_NAMES = /jorge|pablo|ra[uú]l|diego|[aá]lvaro|juan|enrique|jos[eé]|gerardo|tom[aá]s|david|mark|guy|daniel|ryan|eric|andrew|alex|male|hombre/i;
// Las voces neuronales ("Natural", "Online") suenan mucho más humanas que las clásicas.
const NATURAL = /natural|online|neural|premium|enhanced|google/i;

export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
}

function score(voice: VoiceLike, gender: VoiceGender, regionLang: string): number {
  const lang = voice.lang.replace("_", "-").toLowerCase();
  const isFemale = FEMALE_NAMES.test(voice.name) && !/\bmale\b/i.test(voice.name);
  const isMale = MALE_NAMES.test(voice.name) && !isFemale;
  let total = 0;
  if (gender === "female" ? isFemale : isMale) total += 4;
  if (NATURAL.test(voice.name)) total += 3;
  if (lang === regionLang) total += 1;
  return total;
}

/**
 * La voz instalada que mejor encaja con el perfil, solo entre las del idioma activo.
 * null si el equipo no tiene ninguna en ese idioma: el navegador usará la suya.
 */
export function pickVoice<T extends VoiceLike>(voices: readonly T[], locale: string, gender: VoiceGender): T | null {
  const language = locale === "en" ? "en" : "es";
  const regionLang = locale === "en" ? "en-us" : "es-mx";
  const candidates = voices.filter((v) => v.lang.toLowerCase().startsWith(language));
  if (candidates.length === 0) return null;
  return candidates.reduce((best, voice) => (score(voice, gender, regionLang) > score(best, gender, regionLang) ? voice : best));
}
