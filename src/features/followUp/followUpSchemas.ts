import * as yup from "yup";
import { OBJECTIVE_LEVEL_VALUES, RATING_VALUES, TEMPLATE_DIFFICULTIES } from "./followUp";

const rating = () => yup.number().strict().integer().oneOf([...RATING_VALUES]).required();

/** POST /api/play/feedback: las dos preguntas del estudiante. */
export const studentFeedbackSchema = yup.object({
  participanteId: yup.mixed<string | number>().required(),
  enjoyment: rating(),
  learning: rating(),
});

/** POST /api/live/teacher-feedback: evaluación del docente de una sesión suya. */
export const teacherFeedbackSchema = yup.object({
  sessionId: yup.string().strict().matches(/^\d+$/).required(),
  teacherRating: rating(),
  objectiveLevel: yup.number().strict().oneOf([...OBJECTIVE_LEVEL_VALUES]).required(),
  templateDifficulty: yup.string().strict().oneOf([...TEMPLATE_DIFFICULTIES]).nullable().default(null),
});
