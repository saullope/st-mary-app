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
  backgroundImage?: string;
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
      
      // Obtener el tema por fondo. Fallback al primer activo si no existe.
      let temaId = data.backgroundImage ? await getThemeIdByUrl(data.backgroundImage) : null;
      if (!temaId) {
         const firstActiveTheme = await tx.ludiTema.findFirst({ where: { activo: true } });
         temaId = firstActiveTheme ? Number(firstActiveTheme.id) : 1;
      }

      // 2. Update Legacy ACTIVITY
      await tx.aCTIVITY.update({
        where: { id: data.activityId },
        data: {
          activity_name: data.title,
          modified_date: new Date()
        } as any
      });

      // 3. Update LudiActividad
      const ludiActivity = await tx.ludiActividad.update({
        where: { activityId: data.activityId },
        data: {
          tipoActividad: { connect: { id: tipoActividadId } },
          grado: data.config.gradeId ? { connect: { id: data.config.gradeId } } : undefined,
          tema: { connect: { id: BigInt(temaId) } },
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
            missions: data.config.selectedMissions,
            backgroundImage: data.backgroundImage
          })
        },
        create: {
          activity: { connect: { activityId: data.activityId } },
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson: JSON.stringify({
            badges: data.config.selectedBadges,
            missions: data.config.selectedMissions,
            backgroundImage: data.backgroundImage
          })
        }
      });

      // 5. Smart Content Update
      if (data.type === 'ludimemory' && data.memoryImages) {
          // Explicitly delete tarjetas first to avoid FK constraints if CASCADE is not set in SQL Server
          const oldParejas = await tx.ludiMemoriaPareja.findMany({ where: { activityId: data.activityId } });
          const oldParejaIds = oldParejas.map(p => p.id);
          if (oldParejaIds.length > 0) {
              await tx.ludiMemoriaTarjeta.deleteMany({ where: { parejaId: { in: oldParejaIds } } });
          }
          await tx.ludiMemoriaPareja.deleteMany({ where: { activityId: data.activityId } });

          for (const imgUrl of data.memoryImages) {
              const resourceId = await getOrCreateResource(tx, imgUrl, 'image');
              const pareja = await tx.ludiMemoriaPareja.create({
                  data: {
                      activity: { connect: { activityId: ludiActivity.activityId } },
                      etiqueta: "Pareja"
                  }
              });
              await tx.ludiMemoriaTarjeta.create({
                  data: {
                      pareja: { connect: { id: pareja.id } },
                      recurso: { connect: { id: resourceId } },
                      lado: 'A'
                  }
              });
              await tx.ludiMemoriaTarjeta.create({
                  data: {
                      pareja: { connect: { id: pareja.id } },
                      recurso: { connect: { id: resourceId } },
                      lado: 'B'
                  }
              });
          }
      } else {
          const incomingQuestionIds = data.questions.map(q => q.id).filter(id => id && id > 100);

          // Get questions to delete to safely clean their relationships first
          const questionsToDelete = await tx.ludiPregunta.findMany({
              where: {
                  activityId: data.activityId,
                  id: { notIn: incomingQuestionIds as any }
              }
          });

          if (questionsToDelete.length > 0) {
              const qIds = questionsToDelete.map(q => q.id);
              
              // 1. Clear related Student Answers (if any missed the CASCADE)
              await tx.ludiRespuestaEstudiante.deleteMany({ where: { preguntaId: { in: qIds } } });
              
              // 2. Clear related Resources
              await tx.ludiPreguntaRecurso.deleteMany({ where: { preguntaId: { in: qIds } } });
              
              // 3. Clear Options
              await tx.ludiOpcion.deleteMany({ where: { preguntaId: { in: qIds } } });
              
              // 4. Finally delete the questions themselves
              await tx.ludiPregunta.deleteMany({
                  where: { id: { in: qIds } }
              });
          }

          let i = 1;
          for (const q of data.questions) {
              const isExisting = q.id && q.id > 100;
              
              if (isExisting) {
                  const updatedQuestion = await tx.ludiPregunta.update({
                      where: { id: BigInt(q.id!) },
                      data: {
                          numero: i,
                          enunciado: q.text,
                          puntaje: data.config.pointsPerCorrect,
                          tiempoLimiteMs: data.config.timeLimit * 1000
                      }
                  });

                  if ('answers' in q) {
                      const quizQ = q as LudiQuizQuestion;
                      const incomingOptionIds = quizQ.answers.map(a => a.id).filter(id => id && id > 100);

                      // Safely delete options by clearing related student answers first (in case CASCADE is missing)
                      const optionsToDelete = await tx.ludiOpcion.findMany({
                          where: { preguntaId: updatedQuestion.id, id: { notIn: incomingOptionIds as any } }
                      });
                      
                      if (optionsToDelete.length > 0) {
                          const optIds = optionsToDelete.map(o => o.id);
                          await tx.ludiRespuestaEstudiante.deleteMany({ where: { opcionId: { in: optIds } } });
                          await tx.ludiOpcion.deleteMany({
                              where: { id: { in: optIds } }
                          });
                      }

                      for (const ans of quizQ.answers) {
                          if (ans.id && ans.id > 100) {
                              await tx.ludiOpcion.update({
                                  where: { id: BigInt(ans.id) },
                                  data: { texto: ans.text, esCorrecta: ans.isCorrect }
                              });
                          } else {
                              await tx.ludiOpcion.create({
                                  data: { preguntaId: updatedQuestion.id, indice: ans.id, texto: ans.text, esCorrecta: ans.isCorrect }
                              });
                          }
                      }
                  } else {
                      const tfQ = q as TrueOrFalseQuestion;
                      const currentOptions = await tx.ludiOpcion.findMany({ where: { preguntaId: updatedQuestion.id } });
                      for (const opt of currentOptions) {
                          await tx.ludiOpcion.update({
                              where: { id: opt.id },
                              data: { esCorrecta: (opt.indice === 1 && tfQ.correctAnswer === "true") || (opt.indice === 2 && tfQ.correctAnswer === "false") }
                          });
                      }
                  }

                  await tx.ludiPreguntaRecurso.deleteMany({ where: { preguntaId: updatedQuestion.id } });
                  if (q.mediaUrl) {
                      const resourceId = await getOrCreateResource(tx, q.mediaUrl, q.mediaType || 'image');
                      await tx.ludiPreguntaRecurso.create({
                          data: {
                              pregunta: { connect: { id: updatedQuestion.id } },
                              recurso: { connect: { id: resourceId } },
                              rol: 'principal'
                          }
                      });
                  }
              } else {
                  const newQuestion = await tx.ludiPregunta.create({
                      data: {
                          activity: { connect: { activityId: ludiActivity.activityId } },
                          numero: i,
                          enunciado: q.text,
                          tipoActividad: { connect: { id: tipoActividadId } },
                          puntaje: data.config.pointsPerCorrect,
                          tiempoLimiteMs: data.config.timeLimit * 1000
                      }
                  });

                  if (q.mediaUrl) {
                    const resourceId = await getOrCreateResource(tx, q.mediaUrl, q.mediaType || 'image');
                    await tx.ludiPreguntaRecurso.create({
                        data: {
                            pregunta: { connect: { id: newQuestion.id } },
                            recurso: { connect: { id: resourceId } },
                            rol: 'principal'
                        }
                    });
                  }

                  if ('answers' in q) {
                      for (const ans of (q as LudiQuizQuestion).answers) {
                          await tx.ludiOpcion.create({
                              data: { preguntaId: newQuestion.id, indice: ans.id, texto: ans.text, esCorrecta: ans.isCorrect }
                          });
                      }
                  } else {
                      const tfQ = q as TrueOrFalseQuestion;
                      await tx.ludiOpcion.create({
                          data: { pregunta: { connect: { id: newQuestion.id } }, indice: 1, texto: "Verdadero", esCorrecta: tfQ.correctAnswer === "true" }
                      });
                      await tx.ludiOpcion.create({
                          data: { pregunta: { connect: { id: newQuestion.id } }, indice: 2, texto: "Falso", esCorrecta: tfQ.correctAnswer === "false" }
                      });
                  }
              }
              i++;
          }
      }

      return ludiActivity;
    });

    return { 
        success: true, 
        message: "Actividad actualizada exitosamente", 
        activityId: result.activityId
    };

  } catch (error: any) {
    console.error("Error updating activity:", error);
    return { error: "Error al actualizar en base de datos: " + error.message };
  }
}
