// "Crea tu primera actividad": pasos, rutas y el estado de la visita en esta pestaña.
// El progreso persistente (estado y paso) vive en LUDI_USER_CONFIG.completed_tours
// a través de useTourPreferences; aquí solo lo que dura mientras la pestaña está abierta.
import { clampStep, FIRST_ACTIVITY_STEPS } from "@/lib/tours/tourProgress";

export type FirstActivityStepId = "sidebar" | "ludiquiz" | "question" | "answers" | "badges" | "save";

export interface FirstActivityStep {
  id: FirstActivityStepId;
  /** Pantalla donde se muestra el paso. */
  route: string;
  /** Elemento resaltado: siempre un atributo data-tour, nunca una clase CSS. */
  selector: string;
  side: "top" | "bottom" | "left" | "right";
}

export const FIRST_ACTIVITY_TOUR_STEPS: readonly FirstActivityStep[] = [
  { id: "sidebar", route: "/dashboard", selector: '[data-tour="sidebar-create-activity"]', side: "right" },
  { id: "ludiquiz", route: "/dashboard/create-activity", selector: '[data-tour="ludiquiz-card"]', side: "bottom" },
  { id: "question", route: "/create/ludiquiz", selector: '[data-tour="question-input"]', side: "bottom" },
  { id: "answers", route: "/create/ludiquiz", selector: '[data-tour="answers-section"]', side: "top" },
  { id: "badges", route: "/create/ludiquiz", selector: '[data-tour="panel-badges"]', side: "left" },
  { id: "save", route: "/create/ludiquiz", selector: '[data-tour="save-activity"]', side: "bottom" },
];

export const stepAt = (step: number): FirstActivityStep => FIRST_ACTIVITY_TOUR_STEPS[clampStep(step) - 1];

/** ?primera-actividad=<paso> abre la visita en ese paso (Configuración > Visitas guiadas). */
export const FIRST_ACTIVITY_PARAM = "primera-actividad";

export const firstActivityHref = (step: number) => `${stepAt(step).route}?${FIRST_ACTIVITY_PARAM}=${clampStep(step)}`;

export const SETTINGS_TOURS_PATH = "/settings/tours";
export const MY_ACTIVITIES_PATH = "/dashboard/my-activities";

/** Paso pedido en la URL, o null si la visita no se abrió desde un enlace. */
export function stepFromSearch(search: string): number | null {
  const raw = new URLSearchParams(search).get(FIRST_ACTIVITY_PARAM);
  if (raw === null) return null;
  const step = Number(raw);
  return Number.isInteger(step) && step >= 1 && step <= FIRST_ACTIVITY_STEPS ? step : 1;
}

// --- Estado de esta pestaña ---------------------------------------------------
// Sobrevive al cambio de layout (panel -> editor) porque es del módulo, no de React.

export interface FirstActivityRuntime {
  /** La visita está mostrando pasos en esta pestaña. */
  running: boolean;
  /** Ruta a la que la propia visita está navegando: no cuenta como "salir del flujo". */
  navigatingTo: string | null;
  /** Tarjeta de cierre visible. */
  done: boolean;
  /** Actividad guardada en el paso final, para "Seguir editando". */
  savedActivityId: number | null;
  /** "Ahora no" en "¿Seguimos?": oculta la tarjeta hasta la siguiente sesión. */
  resumeDismissed: boolean;
}

const RESUME_DISMISSED_KEY = "ludi_first_activity_resume_dismissed";

function readResumeDismissed(): boolean {
  try {
    return sessionStorage.getItem(RESUME_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

let runtime: FirstActivityRuntime = {
  running: false,
  navigatingTo: null,
  done: false,
  savedActivityId: null,
  resumeDismissed: false,
};
let resumeLoaded = false;
const listeners = new Set<() => void>();

export function getRuntime(): FirstActivityRuntime {
  if (!resumeLoaded && typeof window !== "undefined") {
    resumeLoaded = true;
    runtime = { ...runtime, resumeDismissed: readResumeDismissed() };
  }
  return runtime;
}

export function setRuntime(changes: Partial<FirstActivityRuntime>) {
  runtime = { ...getRuntime(), ...changes };
  if (changes.resumeDismissed !== undefined) {
    try {
      if (changes.resumeDismissed) sessionStorage.setItem(RESUME_DISMISSED_KEY, "1");
      else sessionStorage.removeItem(RESUME_DISMISSED_KEY);
    } catch {
      // Sin almacenamiento, "Ahora no" dura hasta recargar la página.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeRuntime(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const SERVER_RUNTIME: FirstActivityRuntime = { ...runtime };
export const getServerRuntime = () => SERVER_RUNTIME;
