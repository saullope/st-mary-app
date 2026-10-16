'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  DEFAULT_FIRST_ACTIVITY,
  DEFAULT_TOUR_PREFERENCES,
  markCompleted,
  postpone,
  resetTours,
  type FirstActivityProgress,
  type TourMode,
  type TourPreferences,
} from '@/lib/tours/tourProgress';

export type { FirstActivityProgress, TourMode, TourPreferences };

// El progreso vive en el servidor (/api/user/tours) para que siga al educador en
// cualquier navegador. Un solo estado por pestaña: los tours y Configuración lo comparten.
interface StoreState {
  preferences: TourPreferences;
  isLoaded: boolean;
}

// Versiones anteriores lo guardaban solo en este navegador; se importa una vez.
const LEGACY_STORAGE_KEY = 'ludigame_tour_preferences';

let state: StoreState = { preferences: DEFAULT_TOUR_PREFERENCES, isLoaded: false };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const setState = (next: StoreState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;
const getServerSnapshot = () => state;

const save = (preferences: TourPreferences) =>
  fetch('/api/user/tours', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  }).catch((error) => console.error('Error saving tour preferences:', error));

function readLegacyCompleted(): string[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.completedTours) ? parsed.completedTours.filter((id: unknown) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function load(): Promise<void> {
  if (loading) return loading;
  loading = fetch('/api/user/tours')
    .then(async (response) => {
      // Sin sesión (p. ej. una actividad pública) no hay visitas que mostrar.
      if (!response.ok) {
        setState({ preferences: { ...DEFAULT_TOUR_PREFERENCES, toursEnabled: false }, isLoaded: true });
        return;
      }
      let preferences: TourPreferences = await response.json();
      const legacy = readLegacyCompleted().filter((id) => !preferences.completed.includes(id));
      if (legacy.length > 0) {
        preferences = { ...preferences, completed: [...preferences.completed, ...legacy] };
        save(preferences);
      }
      setState({ preferences, isLoaded: true });
    })
    .catch((error) => {
      console.error('Error loading tour preferences:', error);
      setState({ preferences: { ...DEFAULT_TOUR_PREFERENCES, toursEnabled: false }, isLoaded: true });
    });
  return loading;
}

function update(change: (prefs: TourPreferences) => TourPreferences) {
  const preferences = change(state.preferences);
  setState({ ...state, preferences });
  save(preferences);
}

export function useTourPreferences() {
  const { preferences, isLoaded } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    load();
  }, []);

  const updatePreferences = useCallback((updates: Partial<TourPreferences>) => {
    update((prefs) => ({ ...prefs, ...updates }));
  }, []);

  const setToursEnabled = useCallback((enabled: boolean) => updatePreferences({ toursEnabled: enabled }), [updatePreferences]);
  const setTourMode = useCallback((mode: TourMode) => updatePreferences({ tourMode: mode }), [updatePreferences]);

  const markTourAsCompleted = useCallback((tourId: string) => {
    update((prefs) => ({ ...prefs, ...markCompleted(prefs, tourId) }));
  }, []);

  /** "Ver más tarde": pospone una visita o todo un recorrido. */
  const postponeTours = useCallback((tourIds: readonly string[]) => {
    update((prefs) => ({ ...prefs, ...postpone(prefs, tourIds) }));
  }, []);

  /** Vuelve a ofrecer visitas concretas; sin argumentos, todas (también la primera actividad). */
  const resetToursProgress = useCallback((tourIds?: readonly string[]) => {
    update((prefs) => ({
      ...prefs,
      ...(tourIds ? resetTours(prefs, tourIds) : { completed: [], later: [], firstActivity: DEFAULT_FIRST_ACTIVITY }),
    }));
  }, []);

  const setFirstActivity = useCallback((firstActivity: FirstActivityProgress) => {
    update((prefs) => ({ ...prefs, firstActivity }));
  }, []);

  const resetAllTours = useCallback(() => resetToursProgress(), [resetToursProgress]);

  const isTourCompleted = useCallback((tourId: string) => preferences.completed.includes(tourId), [preferences.completed]);
  const isTourPostponed = useCallback((tourId: string) => preferences.later.includes(tourId), [preferences.later]);

  return {
    preferences,
    isLoaded,
    setToursEnabled,
    setTourMode,
    markTourAsCompleted,
    postponeTours,
    resetToursProgress,
    resetAllTours,
    isTourCompleted,
    isTourPostponed,
    setFirstActivity,
    updatePreferences,
  };
}
