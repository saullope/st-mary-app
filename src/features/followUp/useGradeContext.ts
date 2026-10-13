import { useTranslations } from "next-intl";

const KNOWN_GRADES = new Set([1, 2, 3]);

/** "primer grado", "second grade"...: el grado de la actividad dentro de una frase. */
export function useGradeContext(gradeId: number | null): string {
  const t = useTranslations("FollowUp.grades");
  return gradeId !== null && KNOWN_GRADES.has(gradeId) ? t(String(gradeId) as "1" | "2" | "3") : t("unknown");
}
