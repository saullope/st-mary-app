import type { TeacherEvaluation } from "./followUp";

/** Única vía de guardado de la evaluación del docente (POST /api/live/teacher-feedback). */
export async function saveTeacherEvaluation(sessionId: string, evaluation: TeacherEvaluation): Promise<boolean> {
  try {
    const response = await fetch("/api/live/teacher-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...evaluation }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error saving teacher evaluation:", error);
    return false;
  }
}
