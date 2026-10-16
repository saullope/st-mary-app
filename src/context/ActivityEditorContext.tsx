"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import type { LessonBlock } from "@/features/lesson/lessonBlocks";
import type { FormQuestion } from "@/features/form/formQuestions";

export type EditorActivityType = "ludiquiz" | "ludimemory" | "trueorfalse" | "ludileccion" | "ludiform";

type ListUpdate<T> = T[] | ((prev: T[]) => T[]);

// Tipos para la configuración de gamificación
export interface GamificationConfig {
  gradeId: number;
  timeLimit: number; // en segundos
  pointsPerCorrect: number;
  selectedBadges: string[]; // IDs de insignias
  selectedMissions: string[]; // IDs o textos de misiones
  voiceEnabled: boolean;
  /** Solo LudiQuiz y Verdadero/Falso: el acierto vale más cuanto antes se responde (ver lib/play/scoring). */
  speedBonus: boolean;
}

  // Estado global del editor
export interface ActivityEditorState {
  // Datos Generales
  activityId: number | null; // ID para saber si estamos editando
  title: string;
  activityType: EditorActivityType | null;
  
  // UI States
  backgroundImage: string;
  themeModalOpen: boolean;
  fullScreen: boolean;

  // Contenido Específico (Union Type simplificado por ahora, se puede refinar)

  questions: (LudiQuizQuestion | TrueOrFalseQuestion)[];
  memoryImages: string[]; // URLs para LudiMemory
  lessonBlocks: LessonBlock[]; // Bloques de LudiLección
  formQuestions: FormQuestion[]; // Preguntas de LudiForm
  
  // Configuración Lúdica (Panel)
  config: GamificationConfig;
}

// Interfaz del Contexto
interface ActivityEditorContextType {
  state: ActivityEditorState;
  
  // Setters Generales
  setActivityId: (id: number | null) => void;
  setTitle: (title: string) => void;
  setActivityType: (type: EditorActivityType) => void;
  
  // Setters UI
  setBackgroundImage: (url: string) => void;
  setThemeModalOpen: (isOpen: boolean) => void;
  setFullScreen: (isFull: boolean) => void;

  // Setters de Contenido
  setQuestions: (questions: (LudiQuizQuestion | TrueOrFalseQuestion)[]) => void;
  setMemoryImages: (images: string[]) => void;
  setLessonBlocks: (blocks: ListUpdate<LessonBlock>) => void;
  setFormQuestions: (questions: ListUpdate<FormQuestion>) => void;
  
  // Setters de Configuración (Gamification Panel)
  updateConfig: (updates: Partial<GamificationConfig>) => void;
  
  // Acciones
  resetEditor: () => void;
}

const defaultState: ActivityEditorState = {
  activityId: null,
  // Vacío hasta que el docente lo escribe; InitialTitleModal pone el título por defecto en su idioma.
  title: "",
  activityType: null,
  backgroundImage: "/images/theme/tema4.jpg",
  themeModalOpen: false,
  fullScreen: false,
  questions: [],
  memoryImages: [],
  lessonBlocks: [],
  formQuestions: [],
  config: {
    gradeId: 1,
    timeLimit: 30,
    pointsPerCorrect: 10,
    selectedBadges: [],
    selectedMissions: [],
    voiceEnabled: true,
    speedBonus: true,
  },
};

const ActivityEditorContext = createContext<ActivityEditorContextType | undefined>(undefined);

export const ActivityEditorProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ActivityEditorState>(defaultState);

  const setActivityId = useCallback((activityId: number | null) => {
    setState((prev) => ({ ...prev, activityId }));
  }, []);

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }));
  }, []);

  const setActivityType = useCallback((activityType: EditorActivityType) => {
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

  // Acepta un updater: las subidas de archivos terminan de forma asíncrona y no deben pisar ediciones recientes.
  const setLessonBlocks = useCallback((next: ListUpdate<LessonBlock>) => {
    setState((prev) => ({ ...prev, lessonBlocks: typeof next === "function" ? next(prev.lessonBlocks) : next }));
  }, []);

  const setFormQuestions = useCallback((next: ListUpdate<FormQuestion>) => {
    setState((prev) => ({ ...prev, formQuestions: typeof next === "function" ? next(prev.formQuestions) : next }));
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
        setActivityId,
        setTitle,
        setActivityType,
        setBackgroundImage,
        setThemeModalOpen,
        setFullScreen,
        setQuestions,
        setMemoryImages,
        setLessonBlocks,
        setFormQuestions,
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
