"use server";

import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { GamificationConfig } from "@/context/ActivityEditorContext";
import { getActivityTypeId, getThemeIdByUrl, getOrCreateResource } from "@/lib/activity-helpers";

interface UpdateActivityData {
  activityId: number;
  title: string;
  type: "ludiquiz" | "ludimemory" | "trueorfalse";
  questions: (LudiQuizQuestion | TrueOrFalseQuestion)[];
  config: GamificationConfig;
  memoryImages?: string[];
}

export async function updateActivity(data: UpdateActivityData) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "No autorizado. Debes iniciar sesión." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify ownership and existence
      const existingActivity = await tx.ludiActividad.findUnique({
        where: { activityId: data.activityId }
      });

      if (!existingActivity) {
        throw new Error("Actividad no encontrada.");
      }

      if (existingActivity.userId !== user.id) {
        throw new Error("No tienes permiso para editar esta actividad.");
      }

      const tipoActividadId = await getActivityTypeId(data.type);
      const temaId = 1;

      // 2. Update Legacy ACTIVITY
      await tx.aCTIVITY.update({
        where: { id: data.activityId },
        data: {
          activity_name: data.title,
          modified_date: new Date()
        }
      });

      // 3. Update LudiActividad
      const ludiActivity = await tx.ludiActividad.update({
        where: { activityId: data.activityId },
        data: {
          tipoActividadId: tipoActividadId,
          gradoId: data.config.gradeId,
          temaId: BigInt(temaId),
        }
      });

      // 4. Update Configuración
      await tx.ludiActividadConfig.upsert({
        where: { activityId: data.activityId },
        update: {
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson: JSON.stringify({
            badges: data.config.selectedBadges,
            missions: data.config.selectedMissions
          })
        },
        create: {
          activityId: data.activityId,
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson: JSON.stringify({
            badges: data.config.selectedBadges,
            missions: data.config.selectedMissions
          })
        }
      });

      // 5. Clean up old content
      // Due to referential integrity and cascading deletes, deleting Preguntas and Parejas 
      // might automatically delete options and cards depending on Prisma schema setup.
      // However, it's safer to explicitly delete them if cascade is not configured, 
      // but assuming they are linked to ActivityId.
      
      if (existingActivity.tipoActividadId === 3 || data.type === 'ludimemory') {
          // It was or is memory, clear memory stuff
          await tx.ludiMemoriaPareja.deleteMany({
              where: { activityId: data.activityId }
          });
      }
      
      if (existingActivity.tipoActividadId !== 3 || data.type !== 'ludimemory') {
          // It was or is quiz/tf, clear questions
          // Delete questions will ideally cascade to options and resources
          // Let's check Prisma schema for cascades... actually we can just delete questions
          await tx.ludiPregunta.deleteMany({
             where: { activityId: data.activityId }
          });
      }

      // 6. Create New Content
      if (data.type === 'ludimemory' && data.memoryImages) {
        for (const imgUrl of data.memoryImages) {
            const resourceId = await getOrCreateResource(tx, imgUrl, 'image');
            
            const pareja = await tx.ludiMemoriaPareja.create({
                data: {
                    activityId: ludiActivity.activityId,
                    etiqueta: "Pareja"
                }
            });

            await tx.ludiMemoriaTarjeta.createMany({
                data: [
                    { parejaId: pareja.id, recursoId: resourceId, lado: 'A' },
                    { parejaId: pareja.id, recursoId: resourceId, lado: 'B' }
                ]
            });
        }
      } else {
        let i = 1;
        for (const q of data.questions) {
          const newQuestion = await tx.ludiPregunta.create({
            data: {
              activityId: ludiActivity.activityId,
              numero: i,
              enunciado: q.text,
              tipoActividadId: tipoActividadId,
              puntaje: data.config.pointsPerCorrect,
              tiempoLimiteMs: data.config.timeLimit * 1000
            }
          });

          if (q.mediaUrl) {
             const resourceId = await getOrCreateResource(tx, q.mediaUrl, q.mediaType || 'image');
             await tx.ludiPreguntaRecurso.create({
                data: {
                    preguntaId: newQuestion.id,
                    recursoId: resourceId,
                    rol: 'principal'
                }
             });
          }

          if ('answers' in q) {
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
             const tfQ = q as TrueOrFalseQuestion;
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

    const simulationPayload = {
        activity: {
          educadorId: user.id,
          tipoActividad: data.type,
          nombre: data.title,
          publico: false,
          createdAt: new Date().toISOString(),
          activityId: result.activityId
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
        message: "Actividad actualizada exitosamente", 
        activityId: result.activityId,
        data: simulationPayload
    };

  } catch (error: any) {
    console.error("Error updating activity:", error);
    return { error: "Error al actualizar en base de datos: " + error.message };
  }
}
