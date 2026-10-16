"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Annoyed, Frown, Laugh, Meh, Smile } from "lucide-react";
import { FaXmark } from "react-icons/fa6";
import { RATING_VALUES, type Rating } from "../followUp";
import styles from "./followUp.module.css";

// Caras de menos a más: se entienden sin saber leer bien todavía.
const FACES = { 1: Frown, 2: Annoyed, 3: Meh, 4: Smile, 5: Laugh } as const;

const QUESTIONS = [
  { key: "enjoyment", scale: "enjoymentScale" },
  { key: "learning", scale: "learningScale" },
] as const;

interface StudentFeedbackFormProps {
  /** Devuelve false si no se pudo guardar, para avisar sin bloquear al estudiante. */
  onSubmit: (enjoyment: Rating, learning: Rating) => Promise<boolean>;
  onSkip: () => void;
}

/**
 * Las dos preguntas del estudiante al terminar cualquier actividad. Una a la vez y con un
 * toque cada una: la segunda carita envía sola, sin botón de enviar. Se puede cerrar.
 * Cada carita es un botón (no un radio): con radios, moverse con las flechas del teclado
 * contaría como responder y enviaría sin querer.
 */
export function StudentFeedbackForm({ onSubmit, onSkip }: StudentFeedbackFormProps) {
  const t = useTranslations("FollowUp.student");
  const [enjoyment, setEnjoyment] = useState<Rating | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const step = enjoyment === null ? 0 : 1;
  const question = QUESTIONS[step];

  // Al pasar a la segunda pregunta, el lector de pantalla la anuncia.
  useEffect(() => {
    if (step === 1) questionRef.current?.focus({ preventScroll: true });
  }, [step]);

  const pick = async (value: Rating) => {
    if (sending) return;
    if (step === 0) return setEnjoyment(value);
    setSending(true);
    setFailed(!(await onSubmit(enjoyment as Rating, value)));
    setSending(false);
  };

  return (
    <section className={styles.studentCard} aria-labelledby="student-feedback-question" aria-busy={sending || undefined}>
      <div className={styles.studentHeader}>
        <p className={styles.stepLabel}>{t("title")} · {t("step", { current: step + 1, total: QUESTIONS.length })}</p>
        <button type="button" className={styles.closeButton} onClick={onSkip} aria-label={t("close")} title={t("close")}>
          <FaXmark aria-hidden="true" />
        </button>
      </div>
      <h2 id="student-feedback-question" ref={questionRef} tabIndex={-1} className={styles.cardTitle}>
        {t(question.key)}
      </h2>
      <div className={styles.faces} role="group" aria-labelledby="student-feedback-question">
        {RATING_VALUES.map((value) => {
          const label = t(`${question.scale}.${value}`);
          const Icon = FACES[value];
          return (
            <button
              key={`${question.key}-${value}`}
              type="button"
              className={styles.faceButton}
              onClick={() => pick(value)}
              disabled={sending}
              aria-label={t("optionLabel", { value, label })}
            >
              <Icon className={styles.faceIcon} aria-hidden />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {failed && <p className={styles.error} role="alert">{t("error")}</p>}
    </section>
  );
}
