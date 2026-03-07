"use server";

import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { GamificationConfig } from "@/context/ActivityEditorContext";
import { getActivityTypeId, getThemeIdByUrl, getOrCreateResource } from "@/lib/activity-helpers";

interface ActivityData {
  title: string;
  type: "ludiquiz" | "ludimemory" | "trueorfalse";
  questions: (LudiQuizQuestion | TrueOrFalseQuestion)[];
  config: GamificationConfig;
  memoryImages?: string[];
}

export async function saveActivity(data: ActivityData) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "No autorizado. Debes iniciar sesión." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener ID del Tipo de Actividad
      const tipoActividadId = await getActivityTypeId(data.type);

      // 2. Obtener Tema ID (asumimos que la config del frontend enviara el URL del fondo, 
      // si no, usaremos un tema por defecto)
      // *NOTA*: Actualmente el ActivityEditorContext no expone 'backgroundImage' directamente en 'config' o 'state',
      // está en el estado local de la página. Para la V1, usaremos el tema 1 por defecto o
      // deberíamos agregarlo al contexto. Asumiré tema 1 (ID 1) si no se puede resolver.
      const temaId = 1; // Placeholder hasta que integremos el tema al contexto global

      // 3. Crear Actividad Principal
      // Necesitamos crear primero un registro en la tabla padre 'ACTIVITY' (si aplica)
      // o directamente en LudiActividad si el schema lo permite.
      // El schema muestra LudiActividad -> relation ACTIVITY.
      // Vamos a crear ACTIVITY primero para cumplir FK.
      
      const legacyActivity = await tx.aCTIVITY.create({
        data: {
          activity_name: data.title,
          activity_desc: "Creada con LudiMaker",
          created_date: new Date(),
          modified_date: new Date()
        }
      });

      const ludiActivity = await tx.ludiActividad.create({
        data: {
          activityId: legacyActivity.id,
          tipoActividadId: tipoActividadId,
          userId: user.id, // Now using LudiUser.id directly (String UUID)
          gradoId: data.config.gradeId,
          temaId: BigInt(temaId),
          publico: false
        }
      });

      // 3.1 Link User to Educator (Resolution Logic) - REMOVED per user request
      // We now link directly to LudiUser

      // 4. Crear Configuración
      await tx.ludiActividadConfig.create({
        data: {
          activityId: ludiActivity.activityId,
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson: JSON.stringify({
            badges: data.config.selectedBadges,
            missions: data.config.selectedMissions
          })
        }
      });

      // 5. Crear Contenido (Preguntas o Memory)
      if (data.type === 'ludimemory' && data.memoryImages) {
        // Lógica para MEMORY
        for (const imgUrl of data.memoryImages) {
            // Crear Recurso
            const resourceId = await getOrCreateResource(tx, imgUrl, 'image');
            
            // Crear Pareja
            const pareja = await tx.ludiMemoriaPareja.create({
                data: {
                    activityId: ludiActivity.activityId,
                    etiqueta: "Pareja"
                }
            });

            // Crear Tarjetas (A y B) - Mismo recurso para ambas (parejas idénticas)
            await tx.ludiMemoriaTarjeta.createMany({
                data: [
                    { parejaId: pareja.id, recursoId: resourceId, lado: 'A' },
                    { parejaId: pareja.id, recursoId: resourceId, lado: 'B' }
                ]
            });
        }

      } else {
        // Lógica para QUIZ / TRUEORFALSE
        let i = 1;
        for (const q of data.questions) {
          const newQuestion = await tx.ludiPregunta.create({
            data: {
              activityId: ludiActivity.activityId,
              numero: i,
              enunciado: q.text,
              tipoActividadId: tipoActividadId,
              puntaje: data.config.pointsPerCorrect, // Heredar de global o específico
              tiempoLimiteMs: data.config.timeLimit * 1000
            }
          });

          // Guardar Recurso de la Pregunta (si tiene)
          if (q.mediaUrl) {
             const resourceId = await getOrCreateResource(tx, q.mediaUrl, q.mediaType || 'image');
             await tx.ludiPreguntaRecurso.create({
                data: {
                    preguntaId: newQuestion.id,
                    recursoId: resourceId,
                    rol: 'principal' // Valor corregido: debe ser 'principal', 'fondo' o 'audio'
                }
             });
          }

          // Guardar Opciones
          if ('answers' in q) {
             // LudiQuiz (Multiple Choice)
             for (const ans of (q as LudiQuizQuestion).answers) {
                await tx.ludiOpcion.create({
                    data: {
                        preguntaId: newQuestion.id,
                        indice: ans.id,
                        texto: ans.text,
                        esCorrecta: ans.isCorrect
                    }
                });
             }
          } else {
             // TrueOrFalse
             const tfQ = q as TrueOrFalseQuestion;
             // Crear opcion Verdadero
             await tx.ludiOpcion.createMany({
                data: [
                    { preguntaId: newQuestion.id, indice: 1, texto: "Verdadero", esCorrecta: tfQ.correctAnswer === "true" },
                    { preguntaId: newQuestion.id, indice: 2, texto: "Falso", esCorrecta: tfQ.correctAnswer === "false" }
                ]
             });
          }
          i++;
        }
      }

      return ludiActivity;
    });

    // Reconstruct simulation payload for optional download
    const simulationPayload = {
        activity: {
          educadorId: user.id, // ID real del usuario logueado
          tipoActividad: data.type,
          nombre: data.title,
          publico: false, // Default
          createdAt: new Date().toISOString(),
          activityId: result.activityId // Include the generated ID
        },
        config: {
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson: {
            badges: data.config.selectedBadges,
            gradeId: data.config.gradeId,
            missions: data.config.selectedMissions
          }
        },
        content: {
          questions: data.questions,
          memoryImages: data.memoryImages || []
        }
    };

    return { 
        success: true, 
        message: "Actividad guardada exitosamente", 
        activityId: result.activityId,
        data: simulationPayload // Include data so frontend can download if needed
    };

  } catch (error: any) {
    console.error("Error saving activity:", error);
    return { error: "Error al guardar en base de datos: " + error.message };
  }
}
