// Color de cada clase y grado en los filtros de Plantillas. Tonos 700: el texto blanco
// encima cumple 4.5:1. Una clase nueva sin color usa el morado de la marca.

const SUBJECT_COLORS: Record<string, string> = {
  "lengua-literatura": "#C2410C",
  matematica: "#1D4ED8",
  "conociendo-mi-mundo": "#15803D",
  "creciendo-en-valores": "#BE185D",
  "educacion-fisica": "#B91C1C",
  "expresion-cultural-artistica": "#7E22CE",
  "taller-arte-cultura": "#A16207",
  efemerides: "#0E7490",
};

const GRADE_COLORS: Record<number, string> = { 1: "#6D28D9", 2: "#0369A1", 3: "#B45309" };

export const BRAND_COLOR = "#5B3FE0";
export const NEUTRAL_COLOR = "#475569";

export const subjectColor = (codigo: string) => SUBJECT_COLORS[codigo] ?? BRAND_COLOR;
export const gradeColor = (gradeId: number) => GRADE_COLORS[gradeId] ?? BRAND_COLOR;
