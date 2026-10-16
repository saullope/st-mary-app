/** Lo emite SaveActivityButton después de guardar con éxito. */
export const ACTIVITY_SAVED_EVENT = "ludi:activity-saved";

export interface ActivitySavedDetail {
  activityId: number | null;
}

/**
 * Avisa que la actividad se guardó. Devuelve false si quien escucha (la visita
 * "Crea tu primera actividad") pidió quedarse en el editor en lugar de ir a Mis actividades.
 */
export function announceActivitySaved(activityId: number | null): boolean {
  return window.dispatchEvent(
    new CustomEvent<ActivitySavedDetail>(ACTIVITY_SAVED_EVENT, { cancelable: true, detail: { activityId } }),
  );
}
