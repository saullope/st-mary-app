import type { ActivityEditorState } from "@/context/ActivityEditorContext";
import type { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { LESSON_RESOURCE_TYPE, type LessonBlock } from "@/features/lesson/lessonBlocks";
import type { FormQuestion } from "@/features/form/formQuestions";

// Debe coincidir con ACTIVITY_TYPE_MAP en src/lib/activity-helpers.ts
const TIPO_ACTIVIDAD_ID: Record<string, number> = {
  ludiquiz: 1,
  trueorfalse: 2,
  ludimemory: 3,
  ludileccion: 4,
  ludiform: 5,
};

function formQuestionToPregunta(question: FormQuestion, index: number, points: number, untitled: string) {
  return {
    id: `preview-q-${index}`,
    numero: index + 1,
    enunciado: question.text || untitled,
    tipoPregunta: question.type,
    esContenido: false,
    tiempoLimiteMs: null,
    puntaje: points,
    opciones: question.options.map((o, optionIndex) => ({
      id: `preview-opt-${index}-${optionIndex}`,
      indice: optionIndex + 1,
      texto: o.text,
      esCorrecta: o.isCorrect,
    })),
    preguntaRecursos: [],
  };
}

function lessonBlockToPregunta(block: LessonBlock, index: number) {
  return {
    id: `preview-q-${index}`,
    numero: index + 1,
    enunciado: block.title,
    contenidoTexto: block.kind === "reading" ? block.body ?? "" : null,
    esContenido: true,
    tiempoLimiteMs: null,
    puntaje: null,
    opciones: [],
    preguntaRecursos: block.kind !== "reading" && block.url
      ? [{ recurso: { url: block.url, tipo: { nombre: LESSON_RESOURCE_TYPE[block.kind] } } }]
      : [],
  };
}

/**
 * Construye un objeto con la misma forma que la consulta de Prisma en
 * /play/student/[id]/page.tsx, a partir del estado en memoria del editor
 * (ActivityEditorContext). Permite reutilizar GameEngine para la Vista
 * Previa del docente sin persistir nada en la base de datos.
 */
/** untitled: texto para preguntas sin enunciado, en el idioma del docente. */
export function buildPreviewSession(state: ActivityEditorState, untitled = "") {
  const { activityType, questions, config, backgroundImage } = state;

  const preguntas = activityType === "ludileccion"
    ? state.lessonBlocks.map(lessonBlockToPregunta)
    : activityType === "ludiform"
      ? state.formQuestions.map((q, index) => formQuestionToPregunta(q, index, config.pointsPerCorrect, untitled))
      : questions.map((q, index) => {
    const opciones = q.isSlide
      ? []
      : "answers" in q
        ? (q as LudiQuizQuestion).answers.map((a) => ({
            id: `preview-opt-${index}-${a.id}`,
            indice: a.id,
            texto: a.text,
            esCorrecta: a.isCorrect,
            opcionRecursos: a.imageUrl ? [{ recurso: { url: a.imageUrl } }] : [],
          }))
        : (() => {
            const tf = q as TrueOrFalseQuestion;
            return [
              // Mismo texto que guarda el servidor; el juego lo muestra por posición en el idioma activo.
              { id: `preview-opt-${index}-1`, indice: 1, texto: "Verdadero", esCorrecta: tf.correctAnswer === "true" },
              { id: `preview-opt-${index}-2`, indice: 2, texto: "Falso", esCorrecta: tf.correctAnswer === "false" },
            ];
          })();

    return {
      id: `preview-q-${index}`,
      numero: index + 1,
      enunciado: q.isSlide ? q.text : q.text || untitled,
      esContenido: Boolean(q.isSlide),
      tiempoLimiteMs: q.isSlide ? null : config.timeLimit * 1000,
      puntaje: q.isSlide ? null : config.pointsPerCorrect,
      opciones,
      preguntaRecursos: q.mediaUrl
        ? [{ recurso: { url: q.mediaUrl, tipo: { nombre: q.mediaType } } }]
        : [],
    };
  });

  return {
    id: "preview",
    // Sin retroalimentación del estudiante: reutiliza el gate que ya
    // tiene GameEngine para ocultar la valoración del estudiante en el resumen.
    user: { config: { enableStudentFeedback: false } },
    LUDI_ACTIVIDAD: {
      tipoActividadId: TIPO_ACTIVIDAD_ID[activityType || "ludiquiz"],
      gradoId: config.gradeId,
      config: {
        tiempoPreguntaMs: config.timeLimit * 1000,
        puntajeBase: config.pointsPerCorrect,
        ajustesJson: JSON.stringify({
          voiceEnabled: config.voiceEnabled,
          speedBonus: config.speedBonus,
          backgroundImage,
        }),
      },
      // Misma forma que ACTIVITY_ACHIEVEMENTS_INCLUDE.
      insignias: config.selectedBadges.map((codigo) => ({ insignia: { codigo } })),
      misiones: config.selectedMissions.map((codigo) => ({ mision: { codigo } })),
      preguntas,
      // Misma forma que LUDI_MEMORIA_PAREJA con sus tarjetas.
      memoriaParejas: activityType === "ludimemory"
        ? state.memoryImages.map((url, index) => ({ id: `preview-pair-${index}`, tarjetas: [{ recurso: { url } }] }))
        : [],
    },
  };
}
