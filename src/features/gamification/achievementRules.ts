// Motor de reglas para otorgar insignias y misiones durante el juego. El catálogo
// (qué logros existen, su regla y su umbral) vive en la BD (ver catalog.ts) y los
// textos en messages; aquí solo se decide si una regla se cumple con las
// estadísticas de la partida. Una regla desconocida nunca se otorga sola.

import type { BadgeDef, MissionDef } from "./catalog";

type RuleDef = Pick<BadgeDef, "code" | "rule" | "threshold">;
type RuleCheck<S> = (stats: S, threshold: number) => boolean;
type RuleTable<S> = Record<string, RuleCheck<S>>;

/** Códigos de las definiciones elegidas que cumplen su regla y aún no se habían otorgado. */
function award<S>(rules: RuleTable<S>, selected: RuleDef[], alreadyAwarded: Set<string>, stats: S): string[] {
  return selected
    .filter((def) => !alreadyAwarded.has(def.code))
    .filter((def) => rules[def.rule]?.(stats, def.threshold ?? 0) ?? false)
    .map((def) => def.code);
}

// --- LudiQuiz y Verdadero/Falso ---

/**
 * Estado corriente de la partida, recalculado por GameEngine después de
 * cada respuesta y una vez más al finalizar (isFinished: true).
 */
export interface GameplayStats {
  /** Tiempo límite configurado por pregunta (constante para toda la actividad) */
  timeLimitMs: number;
  /** Racha de respuestas correctas consecutivas hasta la respuesta actual */
  streak: number;
  totalCorrect: number;
  totalAnswered: number;
  totalScore: number;
  hasFailedOnce: boolean;
  lastAnswerCorrect: boolean;
  lastAnswerHadMedia: boolean;
  lastAnswerTimeMs: number;
  /** Promedio acumulado de tiempo de respuesta - solo relevante cuando isFinished */
  avgAnswerTimeMs: number;
  isFinished: boolean;
}

// "A buen ritmo" en precision_y_ritmo: promedio dentro del 60% del tiempo límite.
const STEADY_PACE_RATIO = 0.6;

/**
 * Insignias de juego. En vivo: primera_correcta, respuesta_rapida (umbral = % del
 * tiempo límite), correcta_multimedia. Al finalizar: precision_y_ritmo (umbral = %
 * mínimo de aciertos), persistente. "manual" (Mente creativa) no se detecta en un
 * quiz de opciones: queda seleccionable pero nunca se otorga sola.
 */
const GAME_BADGE_RULES: RuleTable<GameplayStats> = {
  primera_correcta: (s) => !s.isFinished && s.lastAnswerCorrect && s.totalCorrect === 1,
  respuesta_rapida: (s, pct) =>
    !s.isFinished && s.lastAnswerCorrect && s.timeLimitMs > 0 && s.lastAnswerTimeMs <= (s.timeLimitMs * pct) / 100,
  correcta_multimedia: (s) => !s.isFinished && s.lastAnswerCorrect && s.lastAnswerHadMedia,
  precision_y_ritmo: (s, pct) =>
    s.isFinished &&
    s.totalAnswered > 0 &&
    s.totalCorrect / s.totalAnswered >= pct / 100 &&
    s.timeLimitMs > 0 &&
    s.avgAnswerTimeMs <= s.timeLimitMs * STEADY_PACE_RATIO,
  persistente: (s) => s.isFinished && s.hasFailedOnce,
};

/** Misiones de juego, siempre en vivo: racha (respuestas), rapidez (segundos), puntos. */
const GAME_MISSION_RULES: RuleTable<GameplayStats> = {
  racha: (s, n) => !s.isFinished && s.streak >= n,
  rapidez: (s, seconds) => !s.isFinished && s.lastAnswerCorrect && s.lastAnswerTimeMs <= seconds * 1000,
  puntos: (s, n) => !s.isFinished && s.totalScore >= n,
};

export const evaluateBadges = (selected: BadgeDef[], alreadyAwarded: Set<string>, stats: GameplayStats) =>
  award(GAME_BADGE_RULES, selected, alreadyAwarded, stats);

export const evaluateMissions = (selected: MissionDef[], alreadyAwarded: Set<string>, stats: GameplayStats) =>
  award(GAME_MISSION_RULES, selected, alreadyAwarded, stats);

// --- LudiLección: se gana solo por completar ---

export interface LessonProgressStats {
  totalBlocks: number;
  /** Bloques terminados (pulsó Continuar), en orden. */
  blocksCompleted: number;
  /** Tiempo dedicado a cada bloque terminado, en ms. */
  blockTimesMs: number[];
  /** Índices (en blockTimesMs) de los bloques de lectura o documento. */
  readingBlockIndexes: number[];
  isFinished: boolean;
}

/** Al finalizar: leccion_completa, tiempo_por_bloque y tiempo_de_lectura (umbral en segundos). */
const LESSON_BADGE_RULES: RuleTable<LessonProgressStats> = {
  leccion_completa: (s) => s.isFinished && s.blocksCompleted >= s.totalBlocks,
  tiempo_por_bloque: (s, seconds) =>
    s.isFinished && s.blockTimesMs.length > 0 && s.blockTimesMs.every((ms) => ms >= seconds * 1000),
  tiempo_de_lectura: (s, seconds) =>
    s.isFinished &&
    s.readingBlockIndexes.length > 0 &&
    s.readingBlockIndexes.every((i) => (s.blockTimesMs[i] ?? 0) >= seconds * 1000),
};

/** Se evalúan cada vez que el alumno termina un bloque. */
const LESSON_MISSION_RULES: RuleTable<LessonProgressStats> = {
  bloques: (s, n) => s.blocksCompleted >= n,
  mitad: (s) => s.totalBlocks > 0 && s.blocksCompleted >= Math.ceil(s.totalBlocks / 2),
  completa: (s) => s.isFinished,
};

export const evaluateLessonBadges = (selected: BadgeDef[], alreadyAwarded: Set<string>, stats: LessonProgressStats) =>
  award(LESSON_BADGE_RULES, selected, alreadyAwarded, stats);

export const evaluateLessonMissions = (selected: MissionDef[], alreadyAwarded: Set<string>, stats: LessonProgressStats) =>
  award(LESSON_MISSION_RULES, selected, alreadyAwarded, stats);

// --- LudiForm: sin tiempo; se premia completar, acertar las cerradas y desarrollar las abiertas ---

export interface FormProgressStats {
  /** Preguntas con respuesta en este momento. */
  answeredCount: number;
  /** Mayor cantidad de palabras escritas en una respuesta larga. */
  maxLongAnswerWords: number;
  /** Menor cantidad de palabras entre las respuestas largas; null si no hay. */
  minLongAnswerWords: number | null;
  closedTotal: number;
  /** Aciertos en preguntas cerradas; solo se conoce al entregar. */
  closedCorrect: number;
  submitted: boolean;
}

/** Al entregar: formulario_entregado, cerradas_perfectas, respuestas_desarrolladas (umbral en palabras). */
const FORM_BADGE_RULES: RuleTable<FormProgressStats> = {
  formulario_entregado: (s) => s.submitted,
  cerradas_perfectas: (s) => s.submitted && s.closedTotal > 0 && s.closedCorrect === s.closedTotal,
  respuestas_desarrolladas: (s, words) => s.submitted && s.minLongAnswerWords !== null && s.minLongAnswerWords >= words,
};

/** En vivo mientras responde y al entregar. */
const FORM_MISSION_RULES: RuleTable<FormProgressStats> = {
  respuestas: (s, n) => s.answeredCount >= n,
  escritor: (s, words) => s.maxLongAnswerWords >= words,
  entrega: (s) => s.submitted,
};

export const evaluateFormBadges = (selected: BadgeDef[], alreadyAwarded: Set<string>, stats: FormProgressStats) =>
  award(FORM_BADGE_RULES, selected, alreadyAwarded, stats);

export const evaluateFormMissions = (selected: MissionDef[], alreadyAwarded: Set<string>, stats: FormProgressStats) =>
  award(FORM_MISSION_RULES, selected, alreadyAwarded, stats);

// --- LudiMemory: sin tiempo; se premia encontrar parejas, la precisión y las rachas ---

export interface MemoryProgressStats {
  totalPairs: number;
  pairsFound: number;
  /** Intentos fallidos (dos cartas que no eran pareja). */
  misses: number;
  /** Parejas seguidas sin fallar hasta el intento actual. */
  streak: number;
  isFinished: boolean;
}

/**
 * racha_de_parejas: en vivo (umbral = parejas seguidas). Al terminar: tablero_completo
 * y pocos_fallos (umbral = % máximo de fallos respecto a las parejas).
 */
const MEMORY_BADGE_RULES: RuleTable<MemoryProgressStats> = {
  racha_de_parejas: (s, n) => s.streak >= n,
  tablero_completo: (s) => s.isFinished,
  pocos_fallos: (s, pct) => s.isFinished && s.misses <= Math.floor((s.totalPairs * pct) / 100),
};

/** Se evalúan después de cada intento. */
const MEMORY_MISSION_RULES: RuleTable<MemoryProgressStats> = {
  parejas: (s, n) => s.pairsFound >= n,
  seguidas: (s, n) => s.streak >= n,
  completo: (s) => s.isFinished,
};

export const evaluateMemoryBadges = (selected: BadgeDef[], alreadyAwarded: Set<string>, stats: MemoryProgressStats) =>
  award(MEMORY_BADGE_RULES, selected, alreadyAwarded, stats);

export const evaluateMemoryMissions = (selected: MissionDef[], alreadyAwarded: Set<string>, stats: MemoryProgressStats) =>
  award(MEMORY_MISSION_RULES, selected, alreadyAwarded, stats);

/** Reglas conocidas por catálogo; las pruebas verifican que el catálogo semilla solo use estas. */
export const KNOWN_RULES = {
  badges: [GAME_BADGE_RULES, LESSON_BADGE_RULES, FORM_BADGE_RULES, MEMORY_BADGE_RULES].flatMap(Object.keys).concat("manual"),
  missions: [GAME_MISSION_RULES, LESSON_MISSION_RULES, FORM_MISSION_RULES, MEMORY_MISSION_RULES].flatMap(Object.keys),
};
