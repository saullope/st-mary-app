import type { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import type { GamificationConfig } from "@/context/ActivityEditorContext";
import type { LessonBlock } from "@/features/lesson/lessonBlocks";
import type { FormQuestion } from "@/features/form/formQuestions";

export type ActivityType = "ludiquiz" | "ludimemory" | "trueorfalse" | "ludileccion" | "ludiform";

export const ACTIVITY_TYPES: readonly ActivityType[] = ["ludiquiz", "ludimemory", "trueorfalse", "ludileccion", "ludiform"];

export interface ActivityData {
  title: string;
  type: ActivityType;
  questions: (LudiQuizQuestion | TrueOrFalseQuestion)[];
  config: GamificationConfig;
  backgroundImage?: string;
  memoryImages?: string[];
  lessonBlocks?: LessonBlock[];
  formQuestions?: FormQuestion[];
}

export interface UpdateActivityData extends ActivityData {
  activityId: number;
}

/** Quien guarda: siempre el usuario de la sesión, nunca un id enviado por el cliente. */
export interface ActivityWriter {
  id: string;
}

/** `status` es el código HTTP que devuelve /api/activities. */
export type ActivityWriteResult =
  | { success: true; message: string; activityId: number }
  | { error: string; status: number };

/** Error dentro de la transacción que no es una falla de la BD (404, 403). El mensaje es una clave de messages. */
export class ActivityWriteError extends Error {
  constructor(readonly messageKey: string, readonly status: number) {
    super(messageKey);
  }
}
