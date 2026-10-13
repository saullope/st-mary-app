// Seguimiento de actividades: si una actividad ayudó a cumplir el objetivo de la
// clase, según el docente (LUDI_SESION) y según los estudiantes
// (LUDI_SESION_PARTICIPANTE), consolidado por actividad y grado para el administrador.
// Sin dependencias de servidor: lo usan el juego, los reportes y las rutas.

export const RATING_VALUES = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof RATING_VALUES)[number];

/** Valores de LUDI_SESION.objective_level (hay un CHECK en la BD con el mismo rango). */
export const OBJECTIVE_LEVELS = { no: 0, partial: 1, yes: 2 } as const;
export type ObjectiveLevel = (typeof OBJECTIVE_LEVELS)[keyof typeof OBJECTIVE_LEVELS];
export const OBJECTIVE_LEVEL_VALUES: readonly ObjectiveLevel[] = [OBJECTIVE_LEVELS.yes, OBJECTIVE_LEVELS.partial, OBJECTIVE_LEVELS.no];

/** Pregunta extra solo para copias de una plantilla. */
export const TEMPLATE_DIFFICULTIES = ["BAJA", "ADECUADA", "ALTA"] as const;
export type TemplateDifficulty = (typeof TEMPLATE_DIFFICULTIES)[number];

export interface TeacherEvaluation {
  teacherRating: Rating;
  objectiveLevel: ObjectiveLevel;
  templateDifficulty: TemplateDifficulty | null;
}

/** Lo que dejó el docente en la sesión; null en cada campo si no respondió. */
export interface SessionTeacherEvaluation {
  teacherRating: number | null;
  objectiveLevel: number | null;
  templateDifficulty: string | null;
}

/** El docente cuenta como evaluado cuando respondió la efectividad y el objetivo. */
export const hasTeacherEvaluation = (session: SessionTeacherEvaluation) =>
  session.teacherRating !== null && session.objectiveLevel !== null;

export interface StudentFeedback {
  studentEnjoyment: number | null;
  studentLearning: number | null;
}

export interface StudentFeedbackSummary {
  avgEnjoyment: number | null;
  avgLearning: number | null;
  /** Estudiantes que respondieron las dos preguntas. */
  responses: number;
  participants: number;
}

const average = (values: number[]) => (values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null);

export function summarizeStudentFeedback(participants: StudentFeedback[]): StudentFeedbackSummary {
  const answered = participants.filter((p) => p.studentEnjoyment !== null && p.studentLearning !== null);
  return {
    avgEnjoyment: average(answered.map((p) => p.studentEnjoyment as number)),
    avgLearning: average(answered.map((p) => p.studentLearning as number)),
    responses: answered.length,
    participants: participants.length,
  };
}

/** Una sesión con lo necesario para consolidarla. */
export interface FollowUpSession extends SessionTeacherEvaluation {
  /** Plantilla de origen si es una copia; si no, la propia actividad. Agrupa copias de distintos docentes. */
  groupActivityId: number;
  groupActivityName: string;
  fromTemplate: boolean;
  activityType: string;
  gradeId: number | null;
  gradeName: string | null;
  teacherId: string;
  participants: StudentFeedback[];
}

export interface FollowUpRow {
  key: string;
  activityName: string;
  fromTemplate: boolean;
  activityType: string;
  gradeId: number | null;
  gradeName: string | null;
  sessions: number;
  evaluatedSessions: number;
  teachers: number;
  avgEffectiveness: number | null;
  /** Sobre las sesiones con objetivo respondido; null si ninguna lo respondió. */
  objectiveMetPct: number | null;
  objectivePartialPct: number | null;
  avgEnjoyment: number | null;
  avgLearning: number | null;
  studentResponses: number;
}

const percentage = (part: number, total: number) => (total > 0 ? (part / total) * 100 : null);

/** Consolida por actividad (o plantilla de origen) y grado. */
export function aggregateFollowUp(sessions: FollowUpSession[]): FollowUpRow[] {
  const groups = new Map<string, FollowUpSession[]>();
  sessions.forEach((session) => {
    const key = `${session.groupActivityId}-${session.gradeId ?? "sin-grado"}`;
    groups.set(key, [...(groups.get(key) ?? []), session]);
  });

  return Array.from(groups, ([key, group]) => {
    const [first] = group;
    const ratings = group.flatMap((s) => (s.teacherRating !== null ? [s.teacherRating] : []));
    const objectives = group.flatMap((s) => (s.objectiveLevel !== null ? [s.objectiveLevel] : []));
    const students = summarizeStudentFeedback(group.flatMap((s) => s.participants));
    return {
      key,
      activityName: first.groupActivityName,
      fromTemplate: group.some((s) => s.fromTemplate),
      activityType: first.activityType,
      gradeId: first.gradeId,
      gradeName: first.gradeName,
      sessions: group.length,
      evaluatedSessions: group.filter(hasTeacherEvaluation).length,
      teachers: new Set(group.map((s) => s.teacherId)).size,
      avgEffectiveness: average(ratings),
      objectiveMetPct: percentage(objectives.filter((l) => l === OBJECTIVE_LEVELS.yes).length, objectives.length),
      objectivePartialPct: percentage(objectives.filter((l) => l === OBJECTIVE_LEVELS.partial).length, objectives.length),
      avgEnjoyment: students.avgEnjoyment,
      avgLearning: students.avgLearning,
      studentResponses: students.responses,
    };
  });
}

export type FollowUpSortKey =
  | "activityName"
  | "gradeId"
  | "evaluatedSessions"
  | "avgEffectiveness"
  | "objectiveMetPct"
  | "avgEnjoyment"
  | "avgLearning"
  | "studentResponses";

/** Ordena sin mutar; las filas sin dato van siempre al final, en ambos sentidos. */
export function sortFollowUpRows(rows: FollowUpRow[], key: FollowUpSortKey, direction: "asc" | "desc"): FollowUpRow[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    if (typeof left === "string" && typeof right === "string") return sign * left.localeCompare(right, "es");
    return sign * ((left as number) - (right as number));
  });
}
