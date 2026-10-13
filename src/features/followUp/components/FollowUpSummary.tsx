"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardCheck, X } from "lucide-react";
import {
  hasTeacherEvaluation,
  summarizeStudentFeedback,
  type SessionTeacherEvaluation,
  type StudentFeedback,
  type TeacherEvaluation,
} from "../followUp";
import { saveTeacherEvaluation } from "../teacherEvaluationApi";
import { TeacherEvaluationForm } from "./TeacherEvaluationForm";
import styles from "./FollowUpSummary.module.css";

interface FollowUpSummaryProps {
  sessionId: string;
  gradeId: number | null;
  fromTemplate: boolean;
  initialEvaluation: SessionTeacherEvaluation;
  participants: StudentFeedback[];
  /** Preferencia del docente: si está desactivada no se le insiste, pero puede evaluar igual. */
  remindTeacher: boolean;
}

const formatScore = (value: number | null) => (value === null ? "-" : value.toFixed(1));

/** Seguimiento de la sesión en el reporte del docente: su evaluación y la de sus estudiantes. */
export function FollowUpSummary({ sessionId, gradeId, fromTemplate, initialEvaluation, participants, remindTeacher }: FollowUpSummaryProps) {
  const t = useTranslations("FollowUp");
  const [evaluation, setEvaluation] = useState(initialEvaluation);
  const [editing, setEditing] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const evaluated = hasTeacherEvaluation(evaluation);
  const students = summarizeStudentFeedback(participants);

  const save = async (next: TeacherEvaluation) => {
    const ok = await saveTeacherEvaluation(sessionId, next);
    if (ok) {
      setEvaluation(next);
      setEditing(false);
    }
    return ok;
  };

  const openForm = () => {
    setEditing(true);
    setReminderDismissed(true);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} className={styles.card} aria-labelledby="follow-up-title">
      <h3 id="follow-up-title" className={styles.title}>
        <ClipboardCheck aria-hidden /> {t("summary.title")}
      </h3>

      <div className={styles.columns}>
        <div>
          <h4 className={styles.heading}>{t("summary.teacherHeading")}</h4>
          {editing ? (
            <TeacherEvaluationForm
              gradeId={gradeId}
              fromTemplate={fromTemplate}
              initial={evaluation}
              onSubmit={save}
              onSkip={() => setEditing(false)}
            />
          ) : evaluated ? (
            <>
              <dl className={styles.metrics}>
                <div>
                  <dt>{t("summary.effectiveness")}</dt>
                  <dd>{t("summary.outOfFive", { value: formatScore(evaluation.teacherRating) })}</dd>
                </div>
                <div>
                  <dt>{t("summary.objective")}</dt>
                  <dd>{t(`teacher.objectiveOptions.${evaluation.objectiveLevel as 0 | 1 | 2}`)}</dd>
                </div>
                {fromTemplate && evaluation.templateDifficulty && (
                  <div>
                    <dt>{t("summary.difficulty")}</dt>
                    <dd>{t(`teacher.difficultyOptions.${evaluation.templateDifficulty as "BAJA" | "ADECUADA" | "ALTA"}`)}</dd>
                  </div>
                )}
              </dl>
              <button type="button" className={`${styles.linkButton} no-print`} onClick={openForm}>{t("summary.edit")}</button>
            </>
          ) : (
            <>
              <p className={styles.muted}>{t("summary.pending")}</p>
              <button type="button" className={`${styles.primaryButton} no-print`} onClick={openForm}>{t("summary.evaluate")}</button>
            </>
          )}
        </div>

        <div>
          <h4 className={styles.heading}>{t("summary.studentsHeading")}</h4>
          {students.responses === 0 ? (
            <p className={styles.muted}>{t("summary.noStudentResponses")}</p>
          ) : (
            <>
              <dl className={styles.metrics}>
                <div>
                  <dt>{t("summary.enjoyment")}</dt>
                  <dd>{t("summary.outOfFive", { value: formatScore(students.avgEnjoyment) })}</dd>
                </div>
                <div>
                  <dt>{t("summary.learning")}</dt>
                  <dd>{t("summary.outOfFive", { value: formatScore(students.avgLearning) })}</dd>
                </div>
              </dl>
              <p className={styles.muted}>{t("summary.responses", { responses: students.responses, participants: students.participants })}</p>
            </>
          )}
        </div>
      </div>

      {/* Recordatorio para quien omitió la evaluación al cerrar la sesión; no repite las preguntas. */}
      {remindTeacher && !evaluated && !editing && !reminderDismissed && (
        <div className={`${styles.reminder} no-print`} role="complementary" aria-label={t("teacher.title")}>
          <button type="button" className={styles.reminderClose} onClick={() => setReminderDismissed(true)} aria-label={t("teacher.close")}>
            <X size={16} aria-hidden />
          </button>
          <p className={styles.reminderText}>{t("summary.pending")}</p>
          <button type="button" className={styles.primaryButton} onClick={openForm}>{t("summary.evaluate")}</button>
        </div>
      )}
    </section>
  );
}
