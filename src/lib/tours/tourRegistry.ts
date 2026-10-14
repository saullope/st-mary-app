// Catálogo de visitas guiadas y preguntas frecuentes de Configuración > Visitas guiadas.
// Textos: messages Tours.registry.<id> y TourSettings.faq.<id>.

export type TourGroup = "onboarding" | "activities" | "views";

export interface TourDefinition {
  id: string;
  group: TourGroup;
  /** Pantalla donde vive la visita; null mientras está en preparación. */
  route: string | null;
}

export const TOUR_REGISTRY: TourDefinition[] = [
  { id: "welcome_tour", group: "onboarding", route: "/welcome-educator" },
  { id: "dashboard_tour", group: "onboarding", route: "/dashboard" },
  { id: "create_activity_tour", group: "onboarding", route: "/dashboard/create-activity" },
  { id: "ludiquiz_tour", group: "activities", route: "/create/ludiquiz" },
  { id: "trueorfalse_tour", group: "activities", route: null },
  { id: "ludimemory_tour", group: "activities", route: null },
  { id: "ludileccion_tour", group: "activities", route: null },
  { id: "ludiform_tour", group: "activities", route: null },
  { id: "my_activities_tour", group: "views", route: null },
  { id: "templates_tour", group: "views", route: null },
  { id: "reports_tour", group: "views", route: null },
  { id: "live_session_tour", group: "views", route: null },
];

export const TOUR_GROUPS: TourGroup[] = ["onboarding", "activities", "views"];

export interface FaqEntry {
  id: string;
  /** Visita que muestra la respuesta en la aplicación, si existe. */
  tourId: string | null;
}

export const FAQ: FaqEntry[] = [
  { id: "firstActivity", tourId: "ludiquiz_tour" },
  { id: "correctAnswer", tourId: "ludiquiz_tour" },
  { id: "media", tourId: "ludiquiz_tour" },
  { id: "theme", tourId: "ludiquiz_tour" },
  { id: "gamification", tourId: "ludiquiz_tour" },
  { id: "drafts", tourId: "dashboard_tour" },
  { id: "templates", tourId: null },
  { id: "launch", tourId: null },
  { id: "gradeAndSubjects", tourId: null },
];

export function getTour(tourId: string): TourDefinition | undefined {
  return TOUR_REGISTRY.find((tour) => tour.id === tourId);
}

/** Enlace que abre la visita aunque ya se haya hecho (?tour=, ver useGuidedTour). */
export function tourHref(tour: TourDefinition): string | null {
  return tour.route ? `${tour.route}?tour=${tour.id}` : null;
}
