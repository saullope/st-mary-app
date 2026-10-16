/** Última actividad que editó el docente: la tarjeta "Continuar trabajando" de Inicio. */
export interface ResumeActivity {
  activityId: number;
  typeId: number;
  gradeId: number | null;
  title: string;
  /** ISO: la fecha de la última edición. */
  modifiedAt: string;
  /** Preguntas, bloques o imágenes, según el tipo. */
  items: number;
}
