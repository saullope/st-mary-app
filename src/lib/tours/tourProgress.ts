// Progreso de las visitas guiadas, guardado en LUDI_USER_CONFIG.completed_tours.
// Módulo sin dependencias: lo usan la ruta /api/user/tours y el cliente.

export type TourMode = "full" | "hints";

export const TOUR_MODES: readonly TourMode[] = ["full", "hints"];

/** Estado de "Crea tu primera actividad", la única visita que se ofrece sola. */
export const FIRST_ACTIVITY_STATUSES = ["pendiente", "pospuesta", "en_progreso", "completada"] as const;
export type FirstActivityStatus = (typeof FIRST_ACTIVITY_STATUSES)[number];
export const FIRST_ACTIVITY_STEPS = 6;

export interface FirstActivityProgress {
  status: FirstActivityStatus;
  /** Paso actual, de 1 a FIRST_ACTIVITY_STEPS. */
  step: number;
}

export const DEFAULT_FIRST_ACTIVITY: FirstActivityProgress = { status: "pendiente", step: 1 };

export interface TourProgress {
  /** Visitas terminadas. */
  completed: string[];
  /** Visitas que el educador dejó para después ("Ver más tarde"). */
  later: string[];
  firstActivity: FirstActivityProgress;
}

export interface TourPreferences extends TourProgress {
  toursEnabled: boolean;
  tourMode: TourMode;
}

export const DEFAULT_TOUR_PREFERENCES: TourPreferences = {
  toursEnabled: true,
  tourMode: "full",
  completed: [],
  later: [],
  firstActivity: DEFAULT_FIRST_ACTIVITY,
};

/** Ofrecer el selector de clases para un grado cuenta como un paso más del recorrido. */
export const subjectPromptId = (gradeId: number) => `subjects_grade_${gradeId}`;

const MAX_IDS = 50;
const ID_PATTERN = /^[a-z0-9_]{1,40}$/;

const cleanIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && ID_PATTERN.test(id)))].slice(0, MAX_IDS)
    : [];

export const clampStep = (step: unknown): number =>
  typeof step === "number" && Number.isInteger(step) ? Math.min(Math.max(step, 1), FIRST_ACTIVITY_STEPS) : 1;

export function cleanFirstActivity(value: unknown): FirstActivityProgress {
  if (!value || typeof value !== "object") return DEFAULT_FIRST_ACTIVITY;
  const { status, step } = value as Record<string, unknown>;
  return {
    status: FIRST_ACTIVITY_STATUSES.includes(status as FirstActivityStatus) ? (status as FirstActivityStatus) : "pendiente",
    step: clampStep(step),
  };
}

const EMPTY_PROGRESS: TourProgress = { completed: [], later: [], firstActivity: DEFAULT_FIRST_ACTIVITY };

/** Lee la columna: acepta el formato anterior (una lista de completadas) y el actual.
 *  Sin firstActivity (datos de antes de esta visita) cuenta como pendiente. */
export function parseTourProgress(raw: string | null | undefined): TourProgress {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return { ...EMPTY_PROGRESS, completed: cleanIds(parsed) };
    if (parsed && typeof parsed === "object") {
      const { completed, later, firstActivity } = parsed as Record<string, unknown>;
      return { completed: cleanIds(completed), later: cleanIds(later), firstActivity: cleanFirstActivity(firstActivity) };
    }
  } catch {
    // Un valor dañado no debe romper el panel: se trata como sin progreso.
  }
  return EMPTY_PROGRESS;
}

export function serializeTourProgress(progress: TourProgress): string {
  return JSON.stringify({
    completed: cleanIds(progress.completed),
    later: cleanIds(progress.later),
    firstActivity: cleanFirstActivity(progress.firstActivity),
  });
}

export const isValidTourId = (id: string) => ID_PATTERN.test(id);

export function markCompleted(progress: TourProgress, tourId: string): TourProgress {
  return {
    ...progress,
    completed: progress.completed.includes(tourId) ? progress.completed : [...progress.completed, tourId],
    later: progress.later.filter((id) => id !== tourId),
  };
}

/** "Ver más tarde": deja pendientes las visitas indicadas sin marcarlas como terminadas. */
export function postpone(progress: TourProgress, tourIds: readonly string[]): TourProgress {
  const pending = tourIds.filter((id) => !progress.completed.includes(id));
  return { ...progress, later: [...new Set([...progress.later, ...pending])] };
}

/** Vuelve a ofrecer las visitas indicadas (al retomarlas desde Configuración). */
export function resetTours(progress: TourProgress, tourIds: readonly string[]): TourProgress {
  return {
    ...progress,
    completed: progress.completed.filter((id) => !tourIds.includes(id)),
    later: progress.later.filter((id) => !tourIds.includes(id)),
  };
}

/** La invitación solo se ofrece a quien no la vio, con las visitas activadas y sin actividades. */
export function shouldInviteFirstActivity(prefs: TourPreferences, hasActivities: boolean): boolean {
  return prefs.toursEnabled && !hasActivities && prefs.firstActivity.status === "pendiente";
}

/** "¿Seguimos?": la visita quedó a medias y las visitas automáticas están activadas. */
export function shouldOfferResume(prefs: TourPreferences): boolean {
  return prefs.toursEnabled && prefs.firstActivity.status === "en_progreso";
}
