"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { gradeIdFromKey } from "@/lib/grades";

export { GRADE_LABELS } from "@/lib/grades";

function readGradeCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)selectedGrade=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Grado que el docente eligió en /welcome-educator (componente SelectGrade).
 *
 * SelectGrade.tsx guarda esa elección de tres formas: cookie `selectedGrade`
 * (síncrono, en el propio click), Redux (useAuth().selectedGrade) y
 * localStorage (estos dos últimos vía un useEffect que depende de un
 * re-render, y que puede perder la carrera contra la navegación del
 * <Link href="/dashboard"> del mismo click). /dashboard/templates ya
 * resuelve el grado leyendo esa cookie en el servidor por esta misma razón
 * - aquí se lee del lado del cliente, con Redux/localStorage solo como
 * respaldo.
 */
export function useSelectedGrade(): number | null {
  const { selectedGrade } = useAuth();
  const [gradeKey, setGradeKey] = useState<string | null>(null);

  useEffect(() => {
    const fromCookie = readGradeCookie();
    if (fromCookie) {
      setGradeKey(fromCookie);
      return;
    }
    if (selectedGrade) {
      setGradeKey(selectedGrade);
      return;
    }
    const stored = typeof window !== "undefined" ? localStorage.getItem("grade") : null;
    if (stored) setGradeKey(stored);
  }, [selectedGrade]);

  return gradeIdFromKey(gradeKey);
}
