"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";

// Tipos para la configuración de gamificación
export interface GamificationConfig {
  gradeId: number;
  timeLimit: number; // en segundos
  pointsPerCorrect: number;
  selectedBadges: string[]; // IDs de insignias
  selectedMissions: string[]; // IDs o textos de misiones
  voiceEnabled: boolean;
}

  // Estado global del editor
interface ActivityEditorState {
  // Datos Generales
  title: string;
  activityType: "ludiquiz" | "ludimemory" | "trueorfalse" | null;
  
  // UI States
  backgroundImage: string;
  themeModalOpen: boolean;
  fullScreen: boolean;

  // Contenido Específico (Union Type simplificado por ahora, se puede refinar)

  questions: (LudiQuizQuestion | TrueOrFalseQuestion)[];
  memoryImages: string[]; // URLs para LudiMemory
  
  // Configuración Lúdica (Panel)
  config: GamificationConfig;
}

// Interfaz del Contexto
interface ActivityEditorContextType {
  state: ActivityEditorState;
  
  // Setters Generales
  setTitle: (title: string) => void;
  setActivityType: (type: "ludiquiz" | "ludimemory" | "trueorfalse") => void;
  
  // Setters UI
  setBackgroundImage: (url: string) => void;
  setThemeModalOpen: (isOpen: boolean) => void;
  setFullScreen: (isFull: boolean) => void;

  // Setters de Contenido
  setQuestions: (questions: (LudiQuizQuestion | TrueOrFalseQuestion)[]) => void;
  setMemoryImages: (images: string[]) => void;
  
  // Setters de Configuración (Gamification Panel)
  updateConfig: (updates: Partial<GamificationConfig>) => void;
  
  // Acciones
  resetEditor: () => void;
}

const defaultState: ActivityEditorState = {
  title: "Nueva Actividad",
  activityType: null,
  backgroundImage: "/images/theme/tema4.jpg",
  themeModalOpen: false,
  fullScreen: false,
  questions: [],
  memoryImages: [],
  config: {
    gradeId: 1,
    timeLimit: 60,
    pointsPerCorrect: 10,
    selectedBadges: [],
    selectedMissions: [],
    voiceEnabled: true,
  },
};

const ActivityEditorContext = createContext<ActivityEditorContextType | undefined>(undefined);

export const ActivityEditorProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ActivityEditorState>(defaultState);

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }));
  }, []);

  const setActivityType = useCallback((activityType: "ludiquiz" | "ludimemory" | "trueorfalse") => {
    setState((prev) => ({ ...prev, activityType }));
  }, []);

  const setBackgroundImage = useCallback((backgroundImage: string) => {
    setState((prev) => ({ ...prev, backgroundImage }));
  }, []);

  const setThemeModalOpen = useCallback((themeModalOpen: boolean) => {
    setState((prev) => ({ ...prev, themeModalOpen }));
  }, []);

  const setFullScreen = useCallback((fullScreen: boolean) => {
    setState((prev) => ({ ...prev, fullScreen }));
  }, []);

  const setQuestions = useCallback((questions: (LudiQuizQuestion | TrueOrFalseQuestion)[]) => {
    setState((prev) => ({ ...prev, questions }));
  }, []);

  const setMemoryImages = useCallback((memoryImages: string[]) => {
    setState((prev) => ({ ...prev, memoryImages }));
  }, []);

  const updateConfig = useCallback((updates: Partial<GamificationConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const resetEditor = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <ActivityEditorContext.Provider
      value={{
        state,
        setTitle,
        setActivityType,
        setBackgroundImage,
        setThemeModalOpen,
        setFullScreen,
        setQuestions,
        setMemoryImages,
        updateConfig,
        resetEditor,
      }}
    >
      {children}
    </ActivityEditorContext.Provider>
  );
};

export const useActivityEditor = () => {
  const context = useContext(ActivityEditorContext);
  if (!context) {
    throw new Error("useActivityEditor must be used within an ActivityEditorProvider");
  }
  return context;
};
