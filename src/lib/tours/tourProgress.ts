// Progreso de las visitas guiadas, guardado en LUDI_USER_CONFIG.completed_tours.
// Módulo sin dependencias: lo usan la ruta /api/user/tours y el cliente.

export type TourMode = "full" | "hints";

export const TOUR_MODES: readonly TourMode[] = ["full", "hints"];

export interface TourProgress {
  /** Visitas terminadas: no vuelven a abrirse solas. */
  completed: string[];
  /** Visitas que el educador dejó para después ("Ver más tarde"): tampoco se abren solas. */
  later: string[];
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
};

/** Recorrido inicial: Bienvenida, Inicio, Crear actividad y el editor de LudiQuiz.
 *  "Ver más tarde" en cualquiera de ellos pospone los que faltan. */
export const ONBOARDING_JOURNEY = ["welcome_tour", "dashboard_tour", "create_activity_tour", "ludiquiz_tour"] as const;

/** Ofrecer el selector de clases para un grado cuenta como un paso más del recorrido. */
export const subjectPromptId = (gradeId: number) => `subjects_grade_${gradeId}`;

const MAX_IDS = 50;
const ID_PATTERN = /^[a-z0-9_]{1,40}$/;

const cleanIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && ID_PATTERN.test(id)))].slice(0, MAX_IDS)
    : [];

/** Lee la columna: acepta el formato anterior (una lista de completadas) y el actual. */
export function parseTourProgress(raw: string | null | undefined): TourProgress {
  if (!raw) return { completed: [], later: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return { completed: cleanIds(parsed), later: [] };
    if (parsed && typeof parsed === "object") {
      const { completed, later } = parsed as Record<string, unknown>;
      return { completed: cleanIds(completed), later: cleanIds(later) };
    }
  } catch {
    // Un valor dañado no debe romper el panel: se trata como sin progreso.
  }
  return { completed: [], later: [] };
}

export function serializeTourProgress(progress: TourProgress): string {
  return JSON.stringify({ completed: cleanIds(progress.completed), later: cleanIds(progress.later) });
}

export const isValidTourId = (id: string) => ID_PATTERN.test(id);

/** Se abre sola solo si está activada y el educador no la terminó ni la pospuso. */
export function shouldAutoStart(prefs: TourPreferences, tourId: string): boolean {
  return prefs.toursEnabled && !prefs.completed.includes(tourId) && !prefs.later.includes(tourId);
}

export function markCompleted(progress: TourProgress, tourId: string): TourProgress {
  return {
    completed: progress.completed.includes(tourId) ? progress.completed : [...progress.completed, tourId],
    later: progress.later.filter((id) => id !== tourId),
  };
}

/** "Ver más tarde": deja pendientes las visitas indicadas sin marcarlas como terminadas. */
export function postpone(progress: TourProgress, tourIds: readonly string[]): TourProgress {
  const pending = tourIds.filter((id) => !progress.completed.includes(id));
  return { completed: progress.completed, later: [...new Set([...progress.later, ...pending])] };
}

/** Vuelve a ofrecer las visitas indicadas (al retomarlas desde Configuración). */
export function resetTours(progress: TourProgress, tourIds: readonly string[]): TourProgress {
  return {
    completed: progress.completed.filter((id) => !tourIds.includes(id)),
    later: progress.later.filter((id) => !tourIds.includes(id)),
  };
}
