"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import {
  OBJECTIVE_LEVEL_VALUES,
  RATING_VALUES,
  TEMPLATE_DIFFICULTIES,
  type ObjectiveLevel,
  type Rating,
  type SessionTeacherEvaluation,
  type TeacherEvaluation,
  type TemplateDifficulty,
} from "../followUp";
import { useGradeContext } from "../useGradeContext";
import { ChoiceGroup } from "./ChoiceGroup";
import styles from "./followUp.module.css";

interface TeacherEvaluationFormProps {
  gradeId: number | null;
  /** Copia de una plantilla: se pregunta además por la dificultad. */
  fromTemplate: boolean;
  initial?: SessionTeacherEvaluation | null;
  onSubmit: (evaluation: TeacherEvaluation) => Promise<boolean>;
  onSkip: () => void;
  submitLabel?: string;
  skipLabel?: string;
}

const asRating = (value: number | null | undefined) => (RATING_VALUES as readonly number[]).includes(value ?? -1) ? (value as Rating) : null;
const asObjective = (value: number | null | undefined) => (OBJECTIVE_LEVEL_VALUES as readonly number[]).includes(value ?? -1) ? (value as ObjectiveLevel) : null;
const asDifficulty = (value: string | null | undefined) => (TEMPLATE_DIFFICULTIES as readonly string[]).includes(value ?? "") ? (value as TemplateDifficulty) : null;

/**
 * Evaluación del docente: la misma al terminar la sesión en vivo y desde el
 * reporte, para que el resultado se compare entre sesiones y docentes.
 */
export function TeacherEvaluationForm({ gradeId, fromTemplate, initial, onSubmit, onSkip, submitLabel, skipLabel }: TeacherEvaluationFormProps) {
  const t = useTranslations("FollowUp.teacher");
  const grade = useGradeContext(gradeId);
  const [rating, setRating] = useState<Rating | null>(asRating(initial?.teacherRating));
  const [objective, setObjective] = useState<ObjectiveLevel | null>(asObjective(initial?.objectiveLevel));
  const [difficulty, setDifficulty] = useState<TemplateDifficulty | null>(asDifficulty(initial?.templateDifficulty));
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const complete = rating !== null && objective !== null && (!fromTemplate || difficulty !== null);

  const submit = async () => {
    if (rating === null || objective === null) return;
    setSaving(true);
    const ok = await onSubmit({ teacherRating: rating, objectiveLevel: objective, templateDifficulty: fromTemplate ? difficulty : null });
    setFailed(!ok);
    setSaving(false);
  };

  return (
    <div className={styles.teacherForm}>
      <p className={styles.intro}>{t("intro")}</p>
      <ChoiceGroup
        name="teacher-effectiveness"
        legend={t("effectiveness", { grade })}
        value={rating}
        onChange={setRating}
        choices={RATING_VALUES.map((value) => {
          const label = t(`effectivenessScale.${value}`);
          return { value, label: String(value), ariaLabel: t("ratingLabel", { value, label }), Icon: Star };
        })}
      />
      <ChoiceGroup
        name="teacher-objective"
        legend={t("objective")}
        value={objective}
        onChange={setObjective}
        choices={OBJECTIVE_LEVEL_VALUES.map((value) => ({ value, label: t(`objectiveOptions.${value}`) }))}
      />
      {fromTemplate && (
        <ChoiceGroup
          name="teacher-difficulty"
          legend={t("difficulty")}
          value={difficulty}
          onChange={setDifficulty}
          choices={TEMPLATE_DIFFICULTIES.map((value) => ({ value, label: t(`difficultyOptions.${value}`) }))}
        />
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={submit} disabled={!complete || saving}>
          {saving ? t("saving") : submitLabel ?? t("submit")}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onSkip} disabled={saving}>
          {skipLabel ?? t("skip")}
        </button>
      </div>
      {failed && <p className={styles.error} role="alert">{t("error")}</p>}
    </div>
  );
}
