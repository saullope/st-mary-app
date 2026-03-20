"use server";

import { getActivityById } from "@/services/activityService";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { GamificationConfig } from "@/context/ActivityEditorContext";

export async function getActivityForEdit(id: number) {
  try {
    const activityData = await getActivityById(id);

    if (!activityData) {
      return { error: "Actividad no encontrada" };
    }

    // Determine type
    let type: "ludiquiz" | "ludimemory" | "trueorfalse" = "ludiquiz";
    const typeName = activityData.tipoActividad.nombre.toLowerCase();
    if (typeName.includes("quiz")) type = "ludiquiz";
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
      voiceEnabled: true, // default
    };

    // Parse content
    let questions: (LudiQuizQuestion | TrueOrFalseQuestion)[] = [];
    let memoryImages: string[] = [];

    if (type === "ludimemory") {
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

        if (type === "ludiquiz") {
          return {
            ...baseQuestion,
            answers: p.opciones.map((o: any) => ({
              id: o.indice,
              text: o.texto || "",
              isCorrect: o.esCorrecta,
              imageUrl: null, 
            }))
          } as LudiQuizQuestion;
        } else {
          const correctOption = p.opciones.find((o: any) => o.esCorrecta);
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
        backgroundImage: parsedAjustes.backgroundImage || activityData.tema?.imageUrl || "/images/theme/tema4.jpg",
      }
    };
  } catch (error: any) {
    console.error("Error fetching activity for edit:", error);
    return { error: "Error al obtener la actividad: " + error.message };
  }
}
