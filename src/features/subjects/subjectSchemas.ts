import * as yup from "yup";

/** Clase del catálogo; su nombre se lee por codigo en messages (Subjects.<codigo>). */
export interface Subject {
  id: number;
  codigo: string;
}

/** Clases elegidas para un grado; la ruta comprueba que todas pertenezcan a ese grado. */
export const userSubjectsSchema = yup
  .object({
    gradeId: yup.number().integer().min(1).max(3).required(),
    materiaIds: yup.array(yup.number().integer().positive().required()).max(30).required(),
  })
  .noUnknown()
  .strict();

export type UserSubjectsInput = yup.InferType<typeof userSubjectsSchema>;
