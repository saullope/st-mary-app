"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { FaTrophy, FaListCheck, FaStar, FaPaperPlane } from "react-icons/fa6";
import { notify } from "@/components/ui";
import {
  LONG_ANSWER_MAX_CHARS,
  countWords,
  gradeFormAnswer,
  isAnswered,
  toFormQuestionType,
  type FormAnswer,
  type FormAnswerResult,
  type GradableQuestion,
} from "@/features/form/formQuestions";
import { evaluateFormBadges, evaluateFormMissions, type FormProgressStats } from "@/features/gamification/achievementRules";
import { usePlaySession } from "./usePlaySession";
import { postPlay } from "./playApi";
import { PlayScreen, ReadyCard, GameSummary } from "./PlayScreens";
import styles from "./game.module.css";
import formStyles from "./form.module.css";
import { useTranslations } from "next-intl";

interface FormEngineProps {
  sesion: any;
  previewMode?: boolean;
  onExit?: () => void;
  previewName?: string;
}

interface FormSummary {
  score: number;
  closedCorrect: number;
  closedTotal: number;
  pending: number;
}

type AnswerMap = Record<string, FormAnswer>;

/** Reproductor de LudiForm: todas las preguntas en una página, sin tiempo, entrega única. */
export const FormEngine = ({ sesion, previewMode = false, onExit, previewName }: FormEngineProps) => {
  const {
    config, participant, backgroundImage, selectedBadges, selectedMissions, speak,
    achievementQueue, awardedBadgesRef, awardedMissionsRef, recordBadges, announceMissions,
  } = usePlaySession({ sesion, previewMode, previewName });
  const t = useTranslations("Play.form");
  const tTypes = useTranslations("Editor.form.types");

  const [stage, setStage] = useState<"READY" | "FILLING" | "SUBMITTING" | "SUMMARY">("READY");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [summary, setSummary] = useState<FormSummary | null>(null);

  const preguntas: any[] | undefined = sesion.LUDI_ACTIVIDAD.preguntas;
  const questions: (GradableQuestion & { text: string; optionTexts: Record<string, string> })[] = useMemo(
    () =>
      (preguntas ?? []).map((p) => ({
        id: String(p.id),
        type: toFormQuestionType(p.tipoPregunta),
        text: p.enunciado,
        options: (p.opciones || []).map((o: any) => ({ id: String(o.id), esCorrecta: Boolean(o.esCorrecta) })),
        optionTexts: Object.fromEntries((p.opciones || []).map((o: any) => [String(o.id), o.texto || ""])),
      })),
    [preguntas]
  );

  // Borrador en sessionStorage: una recarga no debe borrar respuestas largas ya escritas.
  const draftKey = `ludi_form_draft_${sesion.id}`;
  useEffect(() => {
    if (previewMode) return;
    try {
      const stored = sessionStorage.getItem(draftKey);
      if (stored) setAnswers(JSON.parse(stored));
    } catch {
      // Sin almacenamiento disponible el formulario funciona igual, solo sin borrador.
    }
  }, [draftKey, previewMode]);

  const saveDraft = (next: AnswerMap) => {
    if (previewMode) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(next));
    } catch {
      // Ver comentario de carga del borrador.
    }
  };

  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;
  const remaining = questions.length - answeredCount;

  const progressStats = (current: AnswerMap, extra: Partial<FormProgressStats> = {}): FormProgressStats => {
    const longWords = questions.filter((q) => q.type === "long").map((q) => countWords(current[q.id]?.text ?? ""));
    return {
      answeredCount: questions.filter((q) => isAnswered(q, current[q.id])).length,
      maxLongAnswerWords: longWords.length ? Math.max(...longWords) : 0,
      minLongAnswerWords: longWords.length ? Math.min(...longWords) : null,
      closedTotal: questions.filter((q) => q.type !== "long").length,
      closedCorrect: 0,
      submitted: false,
      ...extra,
    };
  };

  const updateAnswer = (questionId: string, changes: Partial<FormAnswer>) => {
    const next = { ...answers, [questionId]: { ...answers[questionId], preguntaId: questionId, ...changes } };
    setAnswers(next);
    saveDraft(next);
    announceMissions(evaluateFormMissions(selectedMissions, awardedMissionsRef.current, progressStats(next)));
  };

  const toggleOption = (questionId: string, optionId: string, single: boolean) => {
    const current = answers[questionId]?.optionIds ?? [];
    const optionIds = single
      ? [optionId]
      : current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    updateAnswer(questionId, { optionIds });
  };

  const submit = async () => {
    if (remaining > 0) {
      notify.warning(t("missingAnswers"), t("missingAnswersDescription", { count: remaining }));
      return;
    }
    setStage("SUBMITTING");

    let results: { preguntaId: string; status: FormAnswerResult["status"] }[];
    let score: number;

    if (previewMode) {
      const basePoints = config.puntajeBase || 10;
      const graded = questions.map((q) => ({ preguntaId: q.id, result: gradeFormAnswer(q, answers[q.id], basePoints) }));
      results = graded.map((g) => ({ preguntaId: g.preguntaId, status: g.result.status }));
      score = graded.reduce((sum, g) => sum + g.result.points, 0);
    } else {
      try {
        if (!participant) throw new Error("participant missing");
        const response = await postPlay("/api/play/submit-form", participant, { answers: Object.values(answers) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error);
        results = data.results;
        score = data.puntaje;
        sessionStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Error submitting form:", error);
        notify.error(t("submitFailed"), participant ? t("tryAgain") : t("sessionMissing"));
        setStage("FILLING");
        return;
      }
    }

    const closedCorrect = results.filter((r) => r.status === "correct").length;
    const finalStats = progressStats(answers, { closedCorrect, submitted: true });
    announceMissions(evaluateFormMissions(selectedMissions, awardedMissionsRef.current, finalStats));
    recordBadges(evaluateFormBadges(selectedBadges, awardedBadgesRef.current, finalStats));

    setSummary({
      score,
      closedCorrect,
      closedTotal: finalStats.closedTotal,
      pending: results.filter((r) => r.status === "pending").length,
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setStage("SUMMARY");
  };

  if (stage === "READY") {
    return (
      <PlayScreen backgroundImage={backgroundImage}>
        <ReadyCard name={participant?.name} onStart={() => setStage("FILLING")} />
      </PlayScreen>
    );
  }

  if (stage === "SUMMARY" && summary) {
    return (
      <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
        <div className={styles.centerCard}>
          <GameSummary
            missionCodes={Array.from(awardedMissionsRef.current)}
            badgeCodes={Array.from(awardedBadgesRef.current)}
            onReveal={speak}
            sesion={sesion}
            participant={participant}
            previewMode={previewMode}
            onExit={onExit}
          >
            <FaTrophy className={styles.trophyIcon} aria-hidden="true" />
            <h1 className={styles.summaryTitle}>{t("submitted")}</h1>
            <p className={styles.summaryScore}>{t.rich("score", { score: summary.score, span: (chunks) => <span>{chunks}</span> })}</p>
            {summary.closedTotal > 0 && (
              <p className={formStyles.summaryLine}>
                {t("closedSummary", { correct: summary.closedCorrect, total: summary.closedTotal })}
              </p>
            )}
            {summary.pending > 0 && (
              <p className={formStyles.summaryLine}>
                {t("pendingReview", { count: summary.pending })}
              </p>
            )}
          </GameSummary>
        </div>
      </PlayScreen>
    );
  }

  return (
    <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
      <div className={styles.hud}>
        <div className={styles.hudItem}>
          <FaListCheck aria-hidden="true" /> {t("answered", { answered: answeredCount, total: questions.length })}
        </div>
        <div className={styles.hudItem}>
          <FaStar aria-hidden="true" /> {t("noTimeLimit")}
        </div>
      </div>

      <form
        className={formStyles.formArea}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {questions.map((question, index) => {
          const answer = answers[question.id];
          return (
            <fieldset key={question.id} className={formStyles.questionCard}>
              <legend className={formStyles.questionLegend}>
                <span className={formStyles.questionNumber}>{index + 1}</span>
                <span className={formStyles.questionText}>{question.text}</span>
              </legend>
              <span className={formStyles.questionType}>
                {question.type === "multiple" ? t("markAll") : tTypes(question.type)}
              </span>

              {question.type === "long" ? (
                <>
                  <textarea
                    className={formStyles.longAnswer}
                    rows={5}
                    maxLength={LONG_ANSWER_MAX_CHARS}
                    placeholder={t("answerPlaceholder")}
                    aria-label={t("answerLabel", { number: index + 1 })}
                    value={answer?.text ?? ""}
                    onChange={(e) => updateAnswer(question.id, { text: e.target.value })}
                  />
                  <span className={formStyles.wordCount} aria-live="polite">
                    {t("words", { count: countWords(answer?.text ?? "") })}
                  </span>
                </>
              ) : (
                <div className={formStyles.optionList}>
                  {question.options.map((option) => {
                    const checked = answer?.optionIds?.includes(option.id) ?? false;
                    return (
                      <label key={option.id} className={formStyles.optionRow} data-checked={checked}>
                        <input
                          type={question.type === "single" ? "radio" : "checkbox"}
                          name={`question-${question.id}`}
                          checked={checked}
                          onChange={() => toggleOption(question.id, option.id, question.type === "single")}
                        />
                        <span>{question.optionTexts[option.id]}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          );
        })}

        <div className={formStyles.submitRow}>
          {remaining > 0 && (
            <span className={formStyles.remaining} aria-live="polite">
              {t("remaining", { count: remaining })}
            </span>
          )}
          <button type="submit" className={styles.bigStartBtn} disabled={stage === "SUBMITTING"}>
            <FaPaperPlane aria-hidden="true" /> {stage === "SUBMITTING" ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </PlayScreen>
  );
};
