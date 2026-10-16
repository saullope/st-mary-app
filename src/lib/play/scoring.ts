// Puntaje de una respuesta en LudiQuiz y Verdadero/Falso. Lo calcula el servidor
// (/api/play/submit-answer) y el cliente lo repite solo para mostrarlo al instante.

/** Lo mismo que el editor cuando una actividad no tiene puntaje o tiempo guardados. */
export const DEFAULT_POINTS = 10;
export const DEFAULT_TIME_LIMIT_MS = 30000;

interface AnswerScore {
  correct: boolean;
  /** Puntos que puso el docente para la pregunta. */
  basePoints: number;
  totalTimeMs: number;
  /** Tiempo que tardó en responder; se acota al tiempo de la pregunta. */
  elapsedMs: number;
  /** "Premiar la rapidez" (Panel Lúdico). */
  speedBonus: boolean;
}

/**
 * Sin "premiar la rapidez", un acierto vale exactamente lo que puso el docente. Con ella,
 * esos puntos son el máximo: entre la mitad (al final del tiempo) y el total (al instante).
 */
export function answerPoints({ correct, basePoints, totalTimeMs, elapsedMs, speedBonus }: AnswerScore): number {
  if (!correct) return 0;
  if (!speedBonus) return basePoints;
  const elapsed = Math.min(Math.max(elapsedMs, 0), totalTimeMs);
  const timeFactor = totalTimeMs > 0 ? (totalTimeMs - elapsed) / totalTimeMs : 0;
  return Math.round(basePoints * (0.5 + 0.5 * timeFactor));
}

/** Lee "premiar la rapidez" de LudiActividadConfig.ajustesJson. Sin dato, sí: era lo de siempre. */
export function readSpeedBonus(ajustesJson: string | null | undefined): boolean {
  if (!ajustesJson) return true;
  try {
    const value = (JSON.parse(ajustesJson) as { speedBonus?: unknown }).speedBonus;
    return typeof value === "boolean" ? value : true;
  } catch {
    return true;
  }
}
