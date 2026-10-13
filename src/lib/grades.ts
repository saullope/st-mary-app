// Grados de la app. Módulo sin dependencias de cliente: lo usan componentes de
// servidor (cookie selectedGrade) y el hook useSelectedGrade.

// La cookie guarda LUDI_COMMON_GRADE.key_string. Según cómo se creó la base de datos
// viene como "first_grade" o como "firstGrade" (prisma/seed.ts), así que se compara
// sin guiones bajos ni mayúsculas.
const NORMALIZED_GRADE_KEYS: Record<string, number> = {
  firstgrade: 1,
  secondgrade: 2,
  thirdgrade: 3,
};

export const GRADE_LABELS: Record<number, string> = {
  1: "1° Grado",
  2: "2° Grado",
  3: "3° Grado",
};

export const GRADE_COOKIE_NAME = "selectedGrade";

export function gradeIdFromKey(key: string | null | undefined): number | null {
  if (!key) return null;
  return NORMALIZED_GRADE_KEYS[key.replace(/[^a-z]/gi, "").toLowerCase()] ?? null;
}
