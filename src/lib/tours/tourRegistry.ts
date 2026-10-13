import { TourConfig } from '@/hooks/useTourPreferences';

export const TOUR_REGISTRY: TourConfig[] = [
  // Nombre y descripción de cada uno: messages Tours.registry.<id>.
  { id: 'welcome_tour' },
  { id: 'dashboard_tour' },
  { id: 'create_activity_tour' },
  { id: 'ludiquiz_tour' },
];

export function getTourConfig(tourId: string): TourConfig | undefined {
  return TOUR_REGISTRY.find(tour => tour.id === tourId);
}

export function getAllTourIds(): string[] {
  return TOUR_REGISTRY.map(tour => tour.id);
}
