"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SelectGrade, type Grade } from "@/components/educator/SelectGrade";
import SubjectStep from "@/features/subjects/components/SubjectStep";
import type { Subject } from "@/features/subjects/subjectSchemas";
import styles from "@/styles/pages/bienvenida.module.css";

interface WelcomeFlowProps {
  grades: Grade[];
  subjectsByGrade: Record<number, Subject[]>;
  /** Grados para los que todavía no se le preguntó al educador qué clases imparte. */
  pendingSubjectGrades: number[];
}

/**
 * Bienvenida en dos pasos sobre la misma página: elegir el grado y, la primera vez
 * con ese grado, elegir las clases. El contenido se desliza en lugar de abrir un modal.
 */
export default function WelcomeFlow({ grades, subjectsByGrade, pendingSubjectGrades }: WelcomeFlowProps) {
  const t = useTranslations("WelcomeTeacherView");
  const router = useRouter();
  const [subjectGrade, setSubjectGrade] = useState<number | null>(null);
  // Se recuerda el último grado para que el paso no quede vacío mientras sale deslizándose.
  const [lastSubjectGrade, setLastSubjectGrade] = useState<number | null>(null);
  const subjectTitleRef = useRef<HTMLHeadingElement>(null);
  const welcomeTitleRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const askSubjectsFor = pendingSubjectGrades.filter((id) => (subjectsByGrade[id]?.length ?? 0) > 0);
  const onSubjects = subjectGrade !== null;

  const openSubjects = (gradeId: number) => {
    setSubjectGrade(gradeId);
    setLastSubjectGrade(gradeId);
  };

  // preventScroll: el foco no debe desplazar el contenedor, que se mueve con transform.
  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    const target = onSubjects ? subjectTitleRef.current : welcomeTitleRef.current;
    target?.focus({ preventScroll: true });
  }, [onSubjects]);

  return (
    <div className={styles.viewport}>
      <div className={styles.track} data-step={onSubjects ? "subjects" : "grade"}>
        <div className={styles.panel} inert={onSubjects} aria-hidden={onSubjects}>
          <div className={styles["texto-bienvenida"]}>
            <h1 ref={welcomeTitleRef} tabIndex={-1}>{t("welcomeText")}</h1>
          </div>
          <div className="container">
            <div
              className="d-flex flex-row flex-nowrap justify-content-center align-items-center mb-5 mt-4"
              style={{ gap: "20px", width: "100%" }}
            >
              <SelectGrade grades={grades} askSubjectsFor={askSubjectsFor} onAskSubjects={openSubjects} />
            </div>
            <div className={styles["texto-grados"]}>
              <h1>{t("text1")}</h1>
              <h1>{t("text2")}</h1>
            </div>
          </div>
        </div>

        <div className={styles.panel} inert={!onSubjects} aria-hidden={!onSubjects}>
          {lastSubjectGrade !== null && (
            <SubjectStep
              key={lastSubjectGrade}
              ref={subjectTitleRef}
              gradeId={lastSubjectGrade}
              subjects={subjectsByGrade[lastSubjectGrade] ?? []}
              onFinish={() => router.push("/dashboard")}
              onBack={() => setSubjectGrade(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
