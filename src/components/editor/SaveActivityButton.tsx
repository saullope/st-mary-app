"use client";

import { useActivityEditor } from "@/context/ActivityEditorContext";
import { saveActivity } from "@/app/actions/saveActivity";
import { updateActivity } from "@/app/actions/updateActivity";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { notify } from "@/components/ui";
import { validateLessonForSave } from "@/features/lesson/lessonBlocks";
import { validateFormForSave } from "@/features/form/formQuestions";
import { validateMemoryForSave } from "@/features/memory/memoryCards";

export const SaveActivityButton = () => {
  const { state, resetEditor } = useActivityEditor();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    // 1. Validar Título
    if (!state.title || !state.title.trim()) {
      notify.warning("Falta el título", "Ingresa un título para la actividad.");
      return;
    }

    const type = state.activityType || "ludiquiz";

    // 2. Validaciones específicas por tipo de actividad
    let finalQuestions = state.questions;

    if (type === "ludiform") {
      const problem = validateFormForSave(state.formQuestions, state.config.gradeId);
      if (problem) {
        notify.warning("No se puede guardar", problem);
        return;
      }
    } else if (type === "ludileccion") {
      const problem = validateLessonForSave(state.lessonBlocks, state.config.gradeId);
      if (problem) {
        notify.warning("No se puede guardar", problem);
        return;
      }
    } else if (type === "ludimemory") {
      const problem = validateMemoryForSave(state.memoryImages);
      if (problem) {
        notify.warning("No se puede guardar", problem);
        return;
      }
    } else if (type === "ludiquiz") {
      const questions = (state.questions as LudiQuizQuestion[]) || [];
      if (questions.length === 0) {
        notify.warning("No se puede guardar", "Agrega al menos una pregunta a la actividad.");
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
        notify.warning("No se puede guardar", "No hay preguntas válidas. Ingresa el texto de la pregunta y sus respuestas.");
        return;
      }
      if (validQuestions.every((q) => q.isSlide)) {
        notify.warning("No se puede guardar", "Agrega al menos una pregunta además de las diapositivas.");
        return;
      }
      finalQuestions = validQuestions;
    } else if (type === "trueorfalse") {
      const questions = (state.questions as TrueOrFalseQuestion[]) || [];
      if (questions.length === 0) {
        notify.warning("No se puede guardar", "Agrega al menos una afirmación a la actividad.");
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
        notify.warning("No se puede guardar", "No hay afirmaciones válidas. Ingresa el texto y selecciona si es Verdadero o Falso.");
        return;
      }
      if (validQuestions.every((q) => q.isSlide)) {
        notify.warning("No se puede guardar", "Agrega al menos una afirmación además de las diapositivas.");
        return;
      }
      finalQuestions = validQuestions;
    }

    setLoading(true);
    try {
      // 3. Preparar datos para el Server Action
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

      const result: any = state.activityId 
        ? await updateActivity(activityData as any)
        : await saveActivity(activityData as any);

      if (result.error) {
        notify.error("Error al guardar", result.error);
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
          notify.success("¡Actividad actualizada!", "Respaldo JSON descargado.");
        } else {
          notify.success("¡Actividad guardada!", "Respaldo JSON descargado.");
        }
      } else {
        if (state.activityId) {
          notify.success("Actividad actualizada exitosamente.");
        } else {
          notify.success("Actividad guardada exitosamente.");
        }
      }

      // 3. Limpiar y Redirigir
      resetEditor();
      router.push("/dashboard/my-activities"); 

    } catch (error) {
      console.error("Error saving:", error);
      notify.error("Ocurrió un error inesperado al guardar.");
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
          Guardando...
        </>
      ) : (
        <>
           {state.activityId ? "Actualizar" : "Guardar"}
        </>
      )}
    </button>
  );
};
