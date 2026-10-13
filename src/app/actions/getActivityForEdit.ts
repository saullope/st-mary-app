"use server";

import { getActivityById } from "@/services/activityService";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { canAccessActivity } from "@/lib/auth/guards";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { GamificationConfig } from "@/context/ActivityEditorContext";
import { kindFromResourceType, type LessonBlock } from "@/features/lesson/lessonBlocks";
import { toFormQuestionType, type FormQuestion } from "@/features/form/formQuestions";

export async function getActivityForEdit(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado. Debes iniciar sesión." };
    if (!Number.isInteger(id) || !(await canAccessActivity(user, id, "owner"))) {
      return { error: "Actividad no encontrada" };
    }

    const activityData = await getActivityById(id);

    if (!activityData) {
      return { error: "Actividad no encontrada" };
    }

    // Determine type
    let type: "ludiquiz" | "ludimemory" | "trueorfalse" | "ludileccion" | "ludiform" = "ludiquiz";
    const typeName = activityData.tipoActividad.nombre.toLowerCase();
    if (typeName.includes("leccion")) type = "ludileccion";
    else if (typeName.includes("form")) type = "ludiform";
    else if (typeName.includes("quiz")) type = "ludiquiz";
    else if (typeName.includes("memory") || typeName.includes("memoria")) type = "ludimemory";
    else if (typeName.includes("falso") || typeName.includes("false")) type = "trueorfalse";

    // Parse config
    let parsedAjustes: any = { badges: [], missions: [] };
    if (activityData.config?.ajustesJson) {
      try {
        parsedAjustes = JSON.parse(activityData.config.ajustesJson);
      } catch (e) {
        console.error("Error parsing ajustesJson", e);
      }
    }

    const config: GamificationConfig = {
      gradeId: activityData.gradoId || 1,
      timeLimit: activityData.config?.tiempoPreguntaMs ? activityData.config.tiempoPreguntaMs / 1000 : 60,
      pointsPerCorrect: activityData.config?.puntajeBase || 10,
      selectedBadges: parsedAjustes.badges || [],
      selectedMissions: parsedAjustes.missions || [],
      voiceEnabled: parsedAjustes.voiceEnabled ?? true,
    };

    // Parse content
    let questions: (LudiQuizQuestion | TrueOrFalseQuestion)[] = [];
    let memoryImages: string[] = [];
    let lessonBlocks: LessonBlock[] = [];
    let formQuestions: FormQuestion[] = [];

    if (type === "ludiform") {
      formQuestions = activityData.preguntas.map((p: any, index: number) => ({
        id: index + 1,
        type: toFormQuestionType(p.tipoPregunta),
        text: p.enunciado || "",
        options: [...(p.opciones || [])]
          .sort((a: any, b: any) => a.indice - b.indice)
          .map((o: any, optionIndex: number) => ({ id: optionIndex + 1, text: o.texto || "", isCorrect: Boolean(o.esCorrecta) })),
      }));
    } else if (type === "ludileccion") {
      lessonBlocks = activityData.preguntas.map((p: any, index: number) => {
        const recurso = p.preguntaRecursos?.find((pr: any) => pr.rol?.toLowerCase()?.trim() === "principal")?.recurso;
        const url: string | null = recurso?.url?.trim() || null;
        return {
          id: index + 1,
          kind: kindFromResourceType(recurso?.tipo?.nombre, url),
          title: p.enunciado || "",
          url,
          body: p.contenidoTexto || "",
        };
      });
    } else if (type === "ludimemory") {
      // Only get unique images (A and B share the same resource)
      const uniqueImages = new Set<string>();
      activityData.memoriaParejas.forEach((pareja: any) => {
        if (pareja.tarjetas && pareja.tarjetas.length > 0) {
          const url = pareja.tarjetas[0].recurso.url;
          uniqueImages.add(url);
        }
      });
      memoryImages = Array.from(uniqueImages);
    } else {
      questions = activityData.preguntas.map((p: any) => {
        const mediaResource = p.preguntaRecursos?.find((pr: any) => pr.rol?.toLowerCase()?.trim() === 'principal')?.recurso;

        let mediaTypeRaw = mediaResource?.tipo?.nombre?.toLowerCase()?.trim() || null;
        let mediaType = mediaTypeRaw;
        if (mediaTypeRaw === "imagen" || mediaTypeRaw === "image") mediaType = "image";
        if (mediaTypeRaw === "video" || mediaTypeRaw === "youtube") mediaType = "video";
        if (mediaTypeRaw === "audio") mediaType = "audio";
        if (mediaTypeRaw === "presentacion") mediaType = "canva";

        // Check origin for youtube
        const originName = mediaResource?.origen?.nombre?.toLowerCase()?.trim();
        if (originName === "youtube") {
          mediaType = "youtube";
        }

        const baseQuestion = {
          id: p.numero,
          text: p.enunciado,
          mediaType: mediaType as any,
          mediaUrl: mediaResource?.url?.trim() || null,
        };

        if (p.esContenido) {
          return type === "ludiquiz"
            ? ({ ...baseQuestion, answers: [], isSlide: true } as LudiQuizQuestion)
            : ({ ...baseQuestion, correctAnswer: null, isSlide: true } as TrueOrFalseQuestion);
        }

        if (type === "ludiquiz") {
          return {
            ...baseQuestion,
            answers: p.opciones.map((o: any) => ({
              id: o.indice,
              text: o.texto || "",
              isCorrect: o.esCorrecta || o.es_correcta,
              imageUrl: o.opcionRecursos?.[0]?.recurso?.url ?? null,
            }))
          } as LudiQuizQuestion;
        } else {
          const correctOption = p.opciones.find((o: any) => o.esCorrecta || o.es_correcta);
          const isTrueCorrect = correctOption?.texto?.toLowerCase() === "verdadero";

          return {
            ...baseQuestion,
            correctAnswer: isTrueCorrect ? "true" : "false"
          } as TrueOrFalseQuestion;
        }
      });
    }

    return {
      success: true,
      data: {
        activityId: activityData.activityId,
        title: activityData.activity.activity_name,
        type,
        config,
        questions,
        memoryImages,
        lessonBlocks,
        formQuestions,
        backgroundImage: parsedAjustes.backgroundImage || activityData.tema?.imageUrl || "/images/theme/tema4.jpg",
      }
    };
  } catch (error: any) {
    console.error("Error fetching activity for edit:", error);
    return { error: "Error al obtener la actividad: " + error.message };
  }
}
