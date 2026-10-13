import { TourConfig } from '@/hooks/useTourPreferences';

export const TOUR_REGISTRY: TourConfig[] = [
  {
    id: 'welcome_tour',
    name: 'Bienvenida al Educador',
    description: 'Tour inicial que te guía por la página de bienvenida y selección de grado.',
  },
  {
    id: 'dashboard_tour',
    name: 'Dashboard Principal',
    description: 'Conoce tu centro de mando: navegación, creación de actividades y gestión de borradores.',
  },
  {
    id: 'create_activity_tour',
    name: 'Creación de Actividades',
    description: 'Aprende a crear tu primera actividad interactiva desde cero.',
  },
  {
    id: 'ludiquiz_tour',
    name: 'Editor de LudiQuiz',
    description: 'Guía completa del editor de cuestionarios: preguntas, respuestas y panel lúdico.',
  },
];

export function getTourConfig(tourId: string): TourConfig | undefined {
  return TOUR_REGISTRY.find(tour => tour.id === tourId);
}

export function getAllTourIds(): string[] {
  return TOUR_REGISTRY.map(tour => tour.id);
}
