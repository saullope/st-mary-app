"use client";

import { useActivityEditor } from "@/context/ActivityEditorContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { notify } from "@/components/ui";
import { validateLessonForSave } from "@/features/lesson/lessonBlocks";
import { validateFormForSave } from "@/features/form/formQuestions";
import { validateMemoryForSave } from "@/features/memory/memoryCards";
import { useTranslations } from "next-intl";
import { useMessage } from "@/lib/i18n/useMessage";

export const SaveActivityButton = () => {
  const { state, resetEditor } = useActivityEditor();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("Editor.save");
  const translate = useMessage();

  const handleSave = async () => {
    // 1. Validar Título
    if (!state.title || !state.title.trim()) {
      notify.warning(t("missingTitle"), t("missingTitleDescription"));
      return;
    }

    const type = state.activityType || "ludiquiz";

    // 2. Validaciones específicas por tipo de actividad
    let finalQuestions = state.questions;

    if (type === "ludiform") {
      const problem = validateFormForSave(state.formQuestions, state.config.gradeId);
      if (problem) {
        notify.warning(t("cannotSave"), translate(problem));
        return;
      }
    } else if (type === "ludileccion") {
      const problem = validateLessonForSave(state.lessonBlocks, state.config.gradeId);
      if (problem) {
        notify.warning(t("cannotSave"), translate(problem));
        return;
      }
    } else if (type === "ludimemory") {
      const problem = validateMemoryForSave(state.memoryImages);
      if (problem) {
        notify.warning(t("cannotSave"), translate(problem));
        return;
      }
    } else if (type === "ludiquiz") {
      const questions = (state.questions as LudiQuizQuestion[]) || [];
      if (questions.length === 0) {
        notify.warning(t("cannotSave"), t("quizEmpty"));
        return;
      }

      const isQuizQuestionEmpty = (q: LudiQuizQuestion) => {
        const hasText = Boolean(q.text && q.text.trim().length > 0);
        const hasAnswerText = Boolean(q.answers && q.answers.some((a) => a.text && a.text.trim().length > 0));
        const hasMedia = Boolean(q.mediaUrl);
        return !hasText && !hasAnswerText && !hasMedia;
      };

      const validQuestions = questions.filter((q) => !isQuizQuestionEmpty(q));
      if (validQuestions.length === 0) {
        notify.warning(t("cannotSave"), t("quizNoValid"));
        return;
      }
      if (validQuestions.every((q) => q.isSlide)) {
        notify.warning(t("cannotSave"), t("quizOnlySlides"));
        return;
      }
      finalQuestions = validQuestions;
    } else if (type === "trueorfalse") {
      const questions = (state.questions as TrueOrFalseQuestion[]) || [];
      if (questions.length === 0) {
        notify.warning(t("cannotSave"), t("tfEmpty"));
        return;
      }

      const isTfQuestionEmpty = (q: TrueOrFalseQuestion) => {
        const hasText = Boolean(q.text && q.text.trim().length > 0);
        const hasCorrectAnswer = q.correctAnswer !== null && q.correctAnswer !== undefined;
        const hasMedia = Boolean(q.mediaUrl);
        return !hasText && !hasCorrectAnswer && !hasMedia;
      };

      const validQuestions = questions.filter((q) => !isTfQuestionEmpty(q));
      if (validQuestions.length === 0) {
        notify.warning(t("cannotSave"), t("tfNoValid"));
        return;
      }
      if (validQuestions.every((q) => q.isSlide)) {
        notify.warning(t("cannotSave"), t("tfOnlySlides"));
        return;
      }
      finalQuestions = validQuestions;
    }

    setLoading(true);
    try {
      // 3. Preparar datos para /api/activities
      const activityData = {
        activityId: state.activityId || undefined,
        title: state.title,
        type,
        questions: finalQuestions,
        config: state.config,
        backgroundImage: state.backgroundImage,
        memoryImages: state.memoryImages,
        lessonBlocks: state.lessonBlocks,
        formQuestions: state.formQuestions,
      };

      const response = await fetch(state.activityId ? `/api/activities/${state.activityId}` : "/api/activities", {
        method: state.activityId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
      });
      const result: any = await response.json();

      if (result.error) {
        notify.error(t("saveError"), result.error);
        return;
      }

      // 2. Descargar JSON (Modo Simulación)
      if (result.data) {
        const jsonString = JSON.stringify(result.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (state.activityId) {
          notify.success(t("updated"), t("backupDownloaded"));
        } else {
          notify.success(t("saved"), t("backupDownloaded"));
        }
      } else {
        if (state.activityId) {
          notify.success(t("updatedSuccess"));
        } else {
          notify.success(t("savedSuccess"));
        }
      }

      // 3. Limpiar y Redirigir
      resetEditor();
      router.push("/dashboard/my-activities"); 

    } catch (error) {
      console.error("Error saving:", error);
      notify.error(t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn d-flex align-items-center gap-2"
      onClick={handleSave}
      disabled={loading}
      style={{
        fontWeight: "var(--font-weight-semibold)",
        fontFamily: "var(--font-family-primary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "10px 22px",
        boxShadow: "var(--shadow-sm)",
        // Mismo verde que .btnLudiSuccess (LudiDesign.module.css), usado
        // en el resto de la app para acciones de guardado/éxito. Es el
        // único botón sólido del header en el editor de ludiquiz/trueorfalse,
        // así que se refuerza un poco su elevación para que lea como el CTA
        // principal.
        background: "#198754",
        color: "var(--white)",
        border: "none",
        transition: "all 0.2s ease"
      }}
      onMouseOver={(e) => {
        if (loading) return;
        e.currentTarget.style.background = "#157347";
        e.currentTarget.style.boxShadow = "0 8px 18px rgba(25, 135, 84, 0.35)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        if (loading) return;
        e.currentTarget.style.background = "#198754";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {t("saving")}
        </>
      ) : (
        <>
           {state.activityId ? t("update") : t("save")}
        </>
      )}
    </button>
  );
};
