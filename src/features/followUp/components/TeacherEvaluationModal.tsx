"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { TeacherEvaluation } from "../followUp";
import { TeacherEvaluationForm } from "./TeacherEvaluationForm";
import styles from "./followUp.module.css";

interface TeacherEvaluationModalProps {
  gradeId: number | null;
  fromTemplate: boolean;
  /** Guarda y termina la sesión; false si no se pudo guardar (el modal sigue abierto). */
  onSubmit: (evaluation: TeacherEvaluation) => Promise<boolean>;
  /** Termina sin evaluar: el reporte la volverá a ofrecer. */
  onSkip: () => void;
  /** Cierra sin terminar la sesión. */
  onCancel: () => void;
}

/** Evaluación al terminar la sesión en vivo. */
export function TeacherEvaluationModal({ gradeId, fromTemplate, onSubmit, onSkip, onCancel }: TeacherEvaluationModalProps) {
  const t = useTranslations("FollowUp.teacher");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.backdrop}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="teacher-evaluation-title" tabIndex={-1}>
        <button
          type="button"
          className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3"
          onClick={onCancel}
          aria-label={t("close")}
        >
          <X size={18} aria-hidden />
        </button>
        <h2 id="teacher-evaluation-title" className={styles.dialogTitle}>{t("title")}</h2>
        <TeacherEvaluationForm
          gradeId={gradeId}
          fromTemplate={fromTemplate}
          onSubmit={onSubmit}
          onSkip={onSkip}
          submitLabel={t("submitAndFinish")}
          skipLabel={t("skipAndFinish")}
        />
      </div>
    </div>
  );
}
