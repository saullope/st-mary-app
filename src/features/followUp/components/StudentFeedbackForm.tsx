"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Annoyed, Frown, Laugh, Meh, Smile } from "lucide-react";
import { RATING_VALUES, type Rating } from "../followUp";
import { ChoiceGroup, type Choice } from "./ChoiceGroup";
import styles from "./followUp.module.css";

// Caras de menos a más: se entienden sin saber leer bien todavía.
const FACES = { 1: Frown, 2: Annoyed, 3: Meh, 4: Smile, 5: Laugh } as const;

interface StudentFeedbackFormProps {
  /** Devuelve false si no se pudo guardar, para avisar sin bloquear al estudiante. */
  onSubmit: (enjoyment: Rating, learning: Rating) => Promise<boolean>;
  onSkip: () => void;
}

/** Las dos preguntas del estudiante al terminar cualquier actividad. Opcional. */
export function StudentFeedbackForm({ onSubmit, onSkip }: StudentFeedbackFormProps) {
  const t = useTranslations("FollowUp.student");
  const [enjoyment, setEnjoyment] = useState<Rating | null>(null);
  const [learning, setLearning] = useState<Rating | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const scale = (scaleKey: "enjoymentScale" | "learningScale"): Choice<Rating>[] =>
    RATING_VALUES.map((value) => {
      const label = t(`${scaleKey}.${value}`);
      return { value, label, ariaLabel: t("optionLabel", { value, label }), Icon: FACES[value] };
    });

  const submit = async () => {
    if (enjoyment === null || learning === null) return;
    setSending(true);
    setFailed(!(await onSubmit(enjoyment, learning)));
    setSending(false);
  };

  return (
    <section className={styles.studentCard} aria-labelledby="student-feedback-title">
      <h2 id="student-feedback-title" className={styles.cardTitle}>{t("title")}</h2>
      <ChoiceGroup name="student-enjoyment" legend={t("enjoyment")} choices={scale("enjoymentScale")} value={enjoyment} onChange={setEnjoyment} />
      <ChoiceGroup name="student-learning" legend={t("learning")} choices={scale("learningScale")} value={learning} onChange={setLearning} />
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={submit} disabled={enjoyment === null || learning === null || sending}>
          {t("send")}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onSkip}>
          {t("skip")}
        </button>
      </div>
      {failed && <p className={styles.error} role="alert">{t("error")}</p>}
    </section>
  );
}
