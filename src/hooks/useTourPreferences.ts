'use client';

import { useState, useEffect, useCallback } from 'react';

export type TourMode = 'full' | 'hints';

export interface TourPreferences {
  toursEnabled: boolean;
  tourMode: TourMode;
  completedTours: string[];
}

export interface TourConfig {
  id: string;
  name: string;
  description: string;
}

const STORAGE_KEY = 'ludigame_tour_preferences';

const DEFAULT_PREFERENCES: TourPreferences = {
  toursEnabled: true,
  tourMode: 'full',
  completedTours: [],
};

const loadPreferences = (): TourPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      completedTours: Array.isArray(parsed.completedTours) ? parsed.completedTours : [],
    };
  } catch (error) {
    console.error('Error loading tour preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

const savePreferences = (prefs: TourPreferences): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving tour preferences:', error);
  }
};

export function useTourPreferences() {
  const [preferences, setPreferences] = useState<TourPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    setIsLoaded(true);
  }, []);

  const updatePreferences = useCallback((updates: Partial<TourPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      savePreferences(updated);
      return updated;
    });
  }, []);

  const setToursEnabled = useCallback((enabled: boolean) => {
    updatePreferences({ toursEnabled: enabled });
  }, [updatePreferences]);

  const setTourMode = useCallback((mode: TourMode) => {
    updatePreferences({ tourMode: mode });
  }, [updatePreferences]);

  const markTourAsCompleted = useCallback((tourId: string) => {
    setPreferences(prev => {
      if (prev.completedTours.includes(tourId)) return prev;
      
      const updated = {
        ...prev,
        completedTours: [...prev.completedTours, tourId],
      };
      savePreferences(updated);
      return updated;
    });
  }, []);

  const resetAllTours = useCallback(() => {
    updatePreferences({ completedTours: [] });
  }, [updatePreferences]);

  const isTourCompleted = useCallback((tourId: string) => {
    return preferences.completedTours.includes(tourId);
  }, [preferences.completedTours]);

  const shouldShowTour = useCallback((tourId: string) => {
    return preferences.toursEnabled && !preferences.completedTours.includes(tourId);
  }, [preferences.toursEnabled, preferences.completedTours]);

  return {
    preferences,
    isLoaded,
    setToursEnabled,
    setTourMode,
    markTourAsCompleted,
    resetAllTours,
    isTourCompleted,
    shouldShowTour,
    updatePreferences,
  };
}
