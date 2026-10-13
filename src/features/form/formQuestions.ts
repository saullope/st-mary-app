// Modelo, validación y calificación de LudiForm. Sin dependencias de React ni de
// Prisma: lo usan el editor, el reproductor, la Vista Previa y el servidor.

export type FormQuestionType = "single" | "multiple" | "long";

export interface FormOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface FormQuestion {
  id: number;
  type: FormQuestionType;
  text: string;
  /** Vacío en las preguntas de respuesta larga. */
  options: FormOption[];
}

export const FORM_QUESTION_TYPES: FormQuestionType[] = ["single", "multiple", "long"];

export const FORM_QUESTION_LABELS: Record<FormQuestionType, string> = {
  single: "Opción única",
  multiple: "Selección múltiple",
  long: "Respuesta larga",
};

/** LudiForm solo está disponible para tercer grado. */
export const FORM_MIN_GRADE = 3;

export function isFormAvailableForGrade(gradeId: number | null | undefined): boolean {
  return (gradeId ?? 0) >= FORM_MIN_GRADE;
}

export const LONG_ANSWER_MAX_CHARS = 2000;

export function createFormQuestion(id: number, type: FormQuestionType): FormQuestion {
  return {
    id,
    type,
    text: "",
    options: type === "long"
      ? []
      : [
          { id: 1, text: "", isCorrect: false },
          { id: 2, text: "", isCorrect: false },
        ],
  };
}

export function validateFormQuestion(question: FormQuestion): string | null {
  if (!question.text.trim()) return "Escribe el enunciado.";
  if (question.type === "long") return null;
  if (question.options.length < 2) return "Agrega al menos 2 opciones.";
  if (question.options.some((o) => !o.text.trim())) return "Completa el texto de todas las opciones.";
  const correct = question.options.filter((o) => o.isCorrect).length;
  if (correct === 0) return question.type === "single" ? "Marca la opción correcta." : "Marca al menos una opción correcta.";
  if (question.type === "single" && correct > 1) return "Solo una opción puede ser correcta.";
  return null;
}

/** Devuelve el primer problema del formulario, o null si se puede guardar. */
export function validateFormForSave(questions: FormQuestion[] | undefined, gradeId: number): string | null {
  if (!isFormAvailableForGrade(gradeId)) return "LudiForm solo está disponible para tercer grado.";
  if (!questions || questions.length === 0) return "Agrega al menos una pregunta al formulario.";
  for (const [index, question] of questions.entries()) {
    const problem = validateFormQuestion(question);
    if (problem) return `Pregunta ${index + 1}: ${problem}`;
  }
  return null;
}

// --- Respuestas del estudiante y calificación ---

/** Lo que el estudiante contestó en una pregunta, con los ids de opción tal como vienen de la base de datos. */
export interface FormAnswer {
  preguntaId: string;
  optionIds?: string[];
  text?: string;
}

export interface GradableQuestion {
  id: string;
  type: FormQuestionType;
  options: { id: string; esCorrecta: boolean }[];
}

export type FormAnswerResult =
  | { status: "correct"; points: number }
  | { status: "incorrect"; points: 0 }
  | { status: "pending"; points: 0 };

export function isAnswered(question: Pick<GradableQuestion, "type">, answer: FormAnswer | undefined): boolean {
  if (!answer) return false;
  if (question.type === "long") return Boolean(answer.text && answer.text.trim());
  return Boolean(answer.optionIds && answer.optionIds.length > 0);
}

/**
 * Sin temporizador, cada pregunta cerrada vale el puntaje completo o nada.
 * Selección múltiple exige marcar exactamente las opciones correctas.
 * La respuesta larga queda pendiente hasta que el docente la revise.
 */
export function gradeFormAnswer(question: GradableQuestion, answer: FormAnswer | undefined, basePoints: number): FormAnswerResult {
  if (question.type === "long") return { status: "pending", points: 0 };

  const selected = new Set(answer?.optionIds ?? []);
  const correct = question.options.filter((o) => o.esCorrecta).map((o) => o.id);
  const isCorrect =
    question.type === "single"
      ? selected.size === 1 && correct.includes([...selected][0])
      : selected.size === correct.length && correct.every((id) => selected.has(id));

  return isCorrect ? { status: "correct", points: basePoints } : { status: "incorrect", points: 0 };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Valor de LudiPregunta.tipoPregunta; los registros antiguos sin tipo son de opción única. */
export function toFormQuestionType(value: string | null | undefined): FormQuestionType {
  return value === "multiple" || value === "long" ? value : "single";
}

// --- Revisión docente de respuestas escritas ---

export const REVIEW_STATUS = {
  pending: "PENDIENTE",
  reviewed: "REVISADA",
} as const;

/** Las respuestas escritas sin revisar no cuentan como fallo en las estadísticas. */
export function isPendingReview(respuesta: { estadoRevision?: string | null }): boolean {
  return respuesta.estadoRevision === REVIEW_STATUS.pending;
}
