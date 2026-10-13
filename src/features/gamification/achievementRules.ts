// Catálogo único de insignias y misiones + motor de reglas para otorgarlas
// durante el juego real. Usado por el panel de configuración (selección),
// GameEngine (otorgamiento en vivo) y los reportes (mostrar lo ganado) -
// antes estos catálogos vivían duplicados/hardcoded dentro de
// GamificationPanel.tsx.

export type Badge = {
  id: string;
  name: string;
  phrase: string;
  desc: string;
  color: string;
  /** Ilustración en public/images/panelludico, con el mismo estilo plano en todas las actividades. */
  img: string;
};

export const INSIGNIAS: Badge[] = [
  { id: "sabio", name: "Sabio", phrase: "¡Increíble! Respondiste muy bien", desc: "Para estudiantes que responden correctamente.", color: "#5FC4D0", img: "/images/panelludico/sabio.png" },
  { id: "veloz", name: "Veloz", phrase: "¡Eso fue rapidísimo! Eres muy veloz", desc: "Para estudiantes que responden rápidamente.", color: "#9B51E0", img: "/images/panelludico/veloz.png" },
  { id: "valiente", name: "Valiente", phrase: "No te rendiste y seguiste intentando", desc: "Para quienes, aunque fallen, siguen intentando.", color: "#FFDA5F", img: "/images/panelludico/valiente.png" },
  { id: "mente-creativa", name: "Mente Creativa", phrase: "¡Qué creativo! Tus ideas son muy especiales", desc: "Para quienes aportan ideas originales y creativas.", color: "#FF7F7F", img: "/images/panelludico/mente-creativa.png" },
  { id: "agil", name: "Ágil", phrase: "Encontraste la respuesta con rapidez e ingenio", desc: "Para estudiantes que resuelven con destreza y precisión.", color: "#6FCF97", img: "/images/panelludico/agil.png" },
  { id: "detective", name: "Detective", phrase: "¡Eres todo un Detective! Descubriste la respuesta correcta.", desc: "Para quienes descubren la respuesta correcta.", color: "#A567B6", img: "/images/panelludico/detective.png" },
];

export type Mission = {
  id: string;
  text: string;
  studentText: string;
};

export type MissionsByGrade = {
  [key: number]: Mission[];
};

export const MISIONES_POR_GRADO: MissionsByGrade = {
  1: [
    { id: "1-3-en-raya", text: "Responde 3 preguntas correctas seguidas", studentText: "¡Felicitaciones! Lograste responder 3 preguntas seguidas correctamente." },
    { id: "1-rapidez-15s", text: "Responde rápido en menos de 15 segundos", studentText: "¡Genial! Respondiste rápido en menos de 15 segundos." },
    { id: "1-20-puntos", text: "Acumula 20 puntos en total", studentText: "¡Increíble! Acumulaste 20 puntos." },
  ],
  2: [
    { id: "2-4-en-raya", text: "Responde 4 preguntas correctas seguidas", studentText: "¡Excelente! Respondiste 4 preguntas seguidas correctamente." },
    { id: "2-rapidez-12s", text: "Responde rápido en menos de 12 segundos", studentText: "¡Genial! Respondiste rápido en menos de 12 segundos." },
    { id: "2-35-puntos", text: "Acumula 30 puntos en total", studentText: "¡Bravo! Acumulaste 30 puntos." },
  ],
  3: [
    { id: "3-5-en-raya", text: "Responde 5 preguntas correctas seguidas", studentText: "¡Increíble! Respondiste 5 preguntas seguidas correctamente." },
    { id: "3-rapidez-10s", text: "Responde rápido en menos de 10 segundos", studentText: "¡Genial! Respondiste rápido en menos de 10 segundos." },
    { id: "3-45-puntos", text: "Acumula 40 puntos en total", studentText: "¡Fantástico! Acumulaste 40 puntos." },
  ],
};

// --- LudiLección: se gana solo por completar, sin preguntas ---

export const INSIGNIAS_LECCION: Badge[] = [
  { id: "explorador", name: "Explorador", phrase: "¡Recorriste toda la lección!", desc: "Para quienes terminan todos los bloques de la lección.", color: "#0096b4", img: "/images/panelludico/explorador.svg" },
  { id: "atento", name: "Atento", phrase: "Te tomaste tu tiempo en cada parte de la lección", desc: "Para quienes dedican al menos 10 segundos a cada bloque.", color: "#6a4bff", img: "/images/panelludico/atento.svg" },
  { id: "lector", name: "Lector", phrase: "¡Qué buen lector! Leíste con calma", desc: "Para quienes dedican al menos 30 segundos a cada lectura o documento.", color: "#e8692f", img: "/images/panelludico/lector.svg" },
];

export const MISIONES_LECCION_POR_GRADO: MissionsByGrade = {
  1: [
    { id: "L1-2-bloques", text: "Recorre 2 bloques de la lección", studentText: "¡Muy bien! Ya recorriste 2 bloques." },
    { id: "L1-mitad", text: "Llega a la mitad de la lección", studentText: "¡Vas por la mitad de la lección!" },
    { id: "L1-completa", text: "Termina toda la lección", studentText: "¡Felicitaciones! Terminaste la lección." },
  ],
  2: [
    { id: "L2-3-bloques", text: "Recorre 3 bloques de la lección", studentText: "¡Genial! Ya recorriste 3 bloques." },
    { id: "L2-mitad", text: "Llega a la mitad de la lección", studentText: "¡Vas por la mitad de la lección!" },
    { id: "L2-completa", text: "Termina toda la lección", studentText: "¡Excelente! Terminaste la lección." },
  ],
  3: [
    { id: "L3-4-bloques", text: "Recorre 4 bloques de la lección", studentText: "¡Increíble! Ya recorriste 4 bloques." },
    { id: "L3-mitad", text: "Llega a la mitad de la lección", studentText: "¡Vas por la mitad de la lección!" },
    { id: "L3-completa", text: "Termina toda la lección", studentText: "¡Fantástico! Terminaste la lección." },
  ],
};

// --- LudiForm: sin tiempo; se premia completar, acertar las cerradas y desarrollar las abiertas ---

export const INSIGNIAS_FORM: Badge[] = [
  { id: "dedicado", name: "Dedicado", phrase: "¡Respondiste todo el formulario!", desc: "Para quienes entregan el formulario completo.", color: "#198754", img: "/images/panelludico/dedicado.svg" },
  { id: "certero", name: "Certero", phrase: "¡Acertaste todas las preguntas de opción!", desc: "Para quienes aciertan todas las preguntas de opción única y selección múltiple.", color: "#0096b4", img: "/images/panelludico/certero.svg" },
  { id: "pensador", name: "Pensador", phrase: "Explicaste tus ideas con detalle", desc: "Para quienes escriben al menos 20 palabras en cada respuesta larga.", color: "#e8692f", img: "/images/panelludico/pensador.svg" },
];

// LudiForm solo existe para tercer grado.
export const MISIONES_FORM_POR_GRADO: MissionsByGrade = {
  3: [
    { id: "F3-3-respuestas", text: "Responde 3 preguntas", studentText: "¡Muy bien! Ya respondiste 3 preguntas." },
    { id: "F3-escritor", text: "Escribe una respuesta de al menos 20 palabras", studentText: "¡Excelente! Escribiste una respuesta muy completa." },
    { id: "F3-entrega", text: "Entrega el formulario completo", studentText: "¡Felicitaciones! Entregaste el formulario." },
  ],
};

// --- LudiMemory: sin tiempo; se premia encontrar parejas, la precisión y las rachas ---

export const INSIGNIAS_MEMORIA: Badge[] = [
  { id: "coleccionista", name: "Coleccionista", phrase: "¡Encontraste todas las parejas!", desc: "Para quienes encuentran todas las parejas del tablero.", color: "#0096b4", img: "/images/panelludico/coleccionista.svg" },
  { id: "buena-memoria", name: "Buena memoria", phrase: "¡Qué memoria! Casi no fallaste", desc: "Para quienes completan el tablero con pocos intentos fallidos (como máximo la mitad de las parejas).", color: "#6a4bff", img: "/images/panelludico/buena-memoria.svg" },
  { id: "imparable", name: "Imparable", phrase: "¡Encontraste 3 parejas seguidas!", desc: "Para quienes encuentran 3 parejas seguidas sin fallar.", color: "#e8692f", img: "/images/panelludico/imparable.svg" },
];

export const MISIONES_MEMORIA_POR_GRADO: MissionsByGrade = {
  1: [
    { id: "M1-2-parejas", text: "Encuentra 2 parejas", studentText: "¡Muy bien! Ya encontraste 2 parejas." },
    { id: "M1-2-seguidas", text: "Encuentra 2 parejas seguidas", studentText: "¡Genial! Encontraste 2 parejas seguidas." },
    { id: "M1-completo", text: "Completa todo el tablero", studentText: "¡Felicitaciones! Completaste el tablero." },
  ],
  2: [
    { id: "M2-3-parejas", text: "Encuentra 3 parejas", studentText: "¡Genial! Ya encontraste 3 parejas." },
    { id: "M2-2-seguidas", text: "Encuentra 2 parejas seguidas", studentText: "¡Excelente! Encontraste 2 parejas seguidas." },
    { id: "M2-completo", text: "Completa todo el tablero", studentText: "¡Excelente! Completaste el tablero." },
  ],
  3: [
    { id: "M3-4-parejas", text: "Encuentra 4 parejas", studentText: "¡Increíble! Ya encontraste 4 parejas." },
    { id: "M3-3-seguidas", text: "Encuentra 3 parejas seguidas", studentText: "¡Fantástico! Encontraste 3 parejas seguidas." },
    { id: "M3-completo", text: "Completa todo el tablero", studentText: "¡Fantástico! Completaste el tablero." },
  ],
};

type CatalogActivity = "ludileccion" | "ludiform" | "ludimemory" | string | null;

/** Catálogo según el tipo de actividad: lecciones y formularios tienen logros propios. */
export function badgeCatalogFor(activityType: CatalogActivity): Badge[] {
  if (activityType === "ludileccion") return INSIGNIAS_LECCION;
  if (activityType === "ludiform") return INSIGNIAS_FORM;
  if (activityType === "ludimemory") return INSIGNIAS_MEMORIA;
  return INSIGNIAS;
}

export function missionCatalogFor(activityType: CatalogActivity): MissionsByGrade {
  if (activityType === "ludileccion") return MISIONES_LECCION_POR_GRADO;
  if (activityType === "ludiform") return MISIONES_FORM_POR_GRADO;
  if (activityType === "ludimemory") return MISIONES_MEMORIA_POR_GRADO;
  return MISIONES_POR_GRADO;
}

const ALL_BADGES: Badge[] = [...INSIGNIAS, ...INSIGNIAS_LECCION, ...INSIGNIAS_FORM, ...INSIGNIAS_MEMORIA];
const ALL_MISSION_CATALOGS: MissionsByGrade[] = [
  MISIONES_POR_GRADO,
  MISIONES_LECCION_POR_GRADO,
  MISIONES_FORM_POR_GRADO,
  MISIONES_MEMORIA_POR_GRADO,
];

/** Búsqueda en todos los catálogos (reportes, caja sorpresa). */
export function findBadge(id: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

export function findMission(id: string, gradeId: number): Mission | undefined {
  for (const catalog of ALL_MISSION_CATALOGS) {
    const mission = (catalog[gradeId] || []).find((m) => m.id === id);
    if (mission) return mission;
  }
  return undefined;
}

export const ALL_BADGE_IDS: string[] = ALL_BADGES.map((b) => b.id);
export const ALL_MISSION_IDS: string[] = ALL_MISSION_CATALOGS.flatMap((catalog) => Object.values(catalog).flat()).map((m) => m.id);

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

/**
 * Reglas de otorgamiento (documentadas y acordadas explícitamente, ya que
 * las descripciones originales de varias insignias se solapan):
 * - sabio: primera respuesta correcta.
 * - veloz: primera respuesta correcta usando <=40% del tiempo límite.
 * - detective: primera respuesta correcta en una pregunta con multimedia.
 * - agil: al finalizar, con >=80% de aciertos y tiempo promedio <=60% del límite.
 * - valiente: al finalizar, si falló al menos una vez pero completó la actividad.
 * - mente-creativa: sin disparador automático (no detectable en un quiz de
 *   opción múltiple/verdadero-falso) - queda seleccionable pero nunca se
 *   otorga sola.
 */
export function evaluateBadges(
  selectedBadgeIds: string[],
  alreadyAwarded: Set<string>,
  stats: GameplayStats
): string[] {
  const awarded: string[] = [];
  const eligible = (id: string) => selectedBadgeIds.includes(id) && !alreadyAwarded.has(id);

  if (!stats.isFinished) {
    if (eligible("sabio") && stats.lastAnswerCorrect && stats.totalCorrect === 1) {
      awarded.push("sabio");
    }
    if (
      eligible("veloz") &&
      stats.lastAnswerCorrect &&
      stats.timeLimitMs > 0 &&
      stats.lastAnswerTimeMs <= stats.timeLimitMs * 0.4
    ) {
      awarded.push("veloz");
    }
    if (eligible("detective") && stats.lastAnswerCorrect && stats.lastAnswerHadMedia) {
      awarded.push("detective");
    }
  } else {
    if (eligible("agil") && stats.totalAnswered > 0) {
      const accuracy = stats.totalCorrect / stats.totalAnswered;
      if (accuracy >= 0.8 && stats.timeLimitMs > 0 && stats.avgAnswerTimeMs <= stats.timeLimitMs * 0.6) {
        awarded.push("agil");
      }
    }
    if (eligible("valiente") && stats.hasFailedOnce) {
      awarded.push("valiente");
    }
  }

  return awarded;
}

const STREAK_MISSION_RE = /^\d+-(\d+)-en-raya$/;
const SPEED_MISSION_RE = /^\d+-rapidez-(\d+)s$/;
const POINTS_MISSION_RE = /^\d+-(\d+)-puntos$/;

/** Todas las misiones actuales se detectan en vivo (nunca "al finalizar"). */
export function evaluateMissions(
  selectedMissionIds: string[],
  gradeId: number,
  alreadyAwarded: Set<string>,
  stats: GameplayStats
): string[] {
  if (stats.isFinished) return [];

  const gradeMissions = MISIONES_POR_GRADO[gradeId] || [];
  const awarded: string[] = [];

  for (const mission of gradeMissions) {
    if (!selectedMissionIds.includes(mission.id) || alreadyAwarded.has(mission.id)) continue;

    const streakMatch = mission.id.match(STREAK_MISSION_RE);
    if (streakMatch && stats.streak >= Number(streakMatch[1])) {
      awarded.push(mission.id);
      continue;
    }

    const speedMatch = mission.id.match(SPEED_MISSION_RE);
    if (speedMatch && stats.lastAnswerCorrect && stats.lastAnswerTimeMs <= Number(speedMatch[1]) * 1000) {
      awarded.push(mission.id);
      continue;
    }

    const pointsMatch = mission.id.match(POINTS_MISSION_RE);
    if (pointsMatch && stats.totalScore >= Number(pointsMatch[1])) {
      awarded.push(mission.id);
      continue;
    }
  }

  return awarded;
}

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

const LESSON_BLOCKS_MISSION_RE = /^L\d+-(\d+)-bloques$/;
const ATENTO_MIN_MS = 10_000;
const LECTOR_MIN_MS = 30_000;

/**
 * Reglas de LudiLección (solo por completar):
 * - explorador: al finalizar, recorrió todos los bloques.
 * - atento: al finalizar, dedicó al menos 10 s a cada bloque.
 * - lector: al finalizar, la lección tenía lecturas o documentos y dedicó al menos 30 s a cada uno.
 */
export function evaluateLessonBadges(
  selectedBadgeIds: string[],
  alreadyAwarded: Set<string>,
  stats: LessonProgressStats
): string[] {
  if (!stats.isFinished) return [];
  const eligible = (id: string) => selectedBadgeIds.includes(id) && !alreadyAwarded.has(id);
  const awarded: string[] = [];

  if (eligible("explorador") && stats.blocksCompleted >= stats.totalBlocks) {
    awarded.push("explorador");
  }
  if (eligible("atento") && stats.blockTimesMs.length > 0 && stats.blockTimesMs.every((ms) => ms >= ATENTO_MIN_MS)) {
    awarded.push("atento");
  }
  if (
    eligible("lector") &&
    stats.readingBlockIndexes.length > 0 &&
    stats.readingBlockIndexes.every((i) => (stats.blockTimesMs[i] ?? 0) >= LECTOR_MIN_MS)
  ) {
    awarded.push("lector");
  }
  return awarded;
}

/** Misiones de lección: se evalúan cada vez que el alumno termina un bloque. */
export function evaluateLessonMissions(
  selectedMissionIds: string[],
  gradeId: number,
  alreadyAwarded: Set<string>,
  stats: LessonProgressStats
): string[] {
  const awarded: string[] = [];
  for (const mission of MISIONES_LECCION_POR_GRADO[gradeId] || []) {
    if (!selectedMissionIds.includes(mission.id) || alreadyAwarded.has(mission.id)) continue;

    const blocksMatch = mission.id.match(LESSON_BLOCKS_MISSION_RE);
    if (blocksMatch && stats.blocksCompleted >= Number(blocksMatch[1])) {
      awarded.push(mission.id);
    } else if (mission.id.endsWith("-mitad") && stats.totalBlocks > 0 && stats.blocksCompleted >= Math.ceil(stats.totalBlocks / 2)) {
      awarded.push(mission.id);
    } else if (mission.id.endsWith("-completa") && stats.isFinished) {
      awarded.push(mission.id);
    }
  }
  return awarded;
}

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

const FORM_ANSWERS_MISSION_RE = /^F\d+-(\d+)-respuestas$/;
const DETAILED_ANSWER_WORDS = 20;

/** Misiones de formulario: en vivo mientras responde y al entregar. */
export function evaluateFormMissions(
  selectedMissionIds: string[],
  gradeId: number,
  alreadyAwarded: Set<string>,
  stats: FormProgressStats
): string[] {
  const awarded: string[] = [];
  for (const mission of MISIONES_FORM_POR_GRADO[gradeId] || []) {
    if (!selectedMissionIds.includes(mission.id) || alreadyAwarded.has(mission.id)) continue;

    const answersMatch = mission.id.match(FORM_ANSWERS_MISSION_RE);
    if (answersMatch && stats.answeredCount >= Number(answersMatch[1])) {
      awarded.push(mission.id);
    } else if (mission.id.endsWith("-escritor") && stats.maxLongAnswerWords >= DETAILED_ANSWER_WORDS) {
      awarded.push(mission.id);
    } else if (mission.id.endsWith("-entrega") && stats.submitted) {
      awarded.push(mission.id);
    }
  }
  return awarded;
}

/**
 * Insignias de formulario, al entregar:
 * - dedicado: entregó el formulario completo.
 * - certero: había preguntas cerradas y acertó todas.
 * - pensador: había respuestas largas y todas tienen al menos 20 palabras.
 */
export function evaluateFormBadges(
  selectedBadgeIds: string[],
  alreadyAwarded: Set<string>,
  stats: FormProgressStats
): string[] {
  if (!stats.submitted) return [];
  const eligible = (id: string) => selectedBadgeIds.includes(id) && !alreadyAwarded.has(id);
  const awarded: string[] = [];

  if (eligible("dedicado")) awarded.push("dedicado");
  if (eligible("certero") && stats.closedTotal > 0 && stats.closedCorrect === stats.closedTotal) {
    awarded.push("certero");
  }
  if (eligible("pensador") && stats.minLongAnswerWords !== null && stats.minLongAnswerWords >= DETAILED_ANSWER_WORDS) {
    awarded.push("pensador");
  }
  return awarded;
}

export interface MemoryProgressStats {
  totalPairs: number;
  pairsFound: number;
  /** Intentos fallidos (dos cartas que no eran pareja). */
  misses: number;
  /** Parejas seguidas sin fallar hasta el intento actual. */
  streak: number;
  isFinished: boolean;
}

const MEMORY_PAIRS_MISSION_RE = /^M\d+-(\d+)-parejas$/;
const MEMORY_STREAK_MISSION_RE = /^M\d+-(\d+)-seguidas$/;
const IMPARABLE_STREAK = 3;

/** Misiones de memoria: se evalúan después de cada intento. */
export function evaluateMemoryMissions(
  selectedMissionIds: string[],
  gradeId: number,
  alreadyAwarded: Set<string>,
  stats: MemoryProgressStats
): string[] {
  const awarded: string[] = [];
  for (const mission of MISIONES_MEMORIA_POR_GRADO[gradeId] || []) {
    if (!selectedMissionIds.includes(mission.id) || alreadyAwarded.has(mission.id)) continue;

    const pairsMatch = mission.id.match(MEMORY_PAIRS_MISSION_RE);
    const streakMatch = mission.id.match(MEMORY_STREAK_MISSION_RE);
    if (pairsMatch && stats.pairsFound >= Number(pairsMatch[1])) {
      awarded.push(mission.id);
    } else if (streakMatch && stats.streak >= Number(streakMatch[1])) {
      awarded.push(mission.id);
    } else if (mission.id.endsWith("-completo") && stats.isFinished) {
      awarded.push(mission.id);
    }
  }
  return awarded;
}

/**
 * Insignias de memoria:
 * - imparable: en vivo, al encontrar 3 parejas seguidas.
 * - coleccionista: al terminar el tablero.
 * - buena-memoria: al terminar, con fallos <= la mitad de las parejas.
 */
export function evaluateMemoryBadges(
  selectedBadgeIds: string[],
  alreadyAwarded: Set<string>,
  stats: MemoryProgressStats
): string[] {
  const eligible = (id: string) => selectedBadgeIds.includes(id) && !alreadyAwarded.has(id);
  const awarded: string[] = [];

  if (eligible("imparable") && stats.streak >= IMPARABLE_STREAK) awarded.push("imparable");
  if (!stats.isFinished) return awarded;

  if (eligible("coleccionista")) awarded.push("coleccionista");
  if (eligible("buena-memoria") && stats.misses <= Math.floor(stats.totalPairs / 2)) {
    awarded.push("buena-memoria");
  }
  return awarded;
}
