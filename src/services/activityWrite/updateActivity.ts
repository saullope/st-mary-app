import prisma from "@/lib/db";
import type { LudiQuizQuestion, TrueOrFalseQuestion } from "@/lib/types";
import { ActivityWriteError, type ActivityWriteResult, type ActivityWriter, type UpdateActivityData } from "./types";
import { getActivityTypeId, getThemeIdByUrl, getOrCreateResource, setOptionImage, replaceLessonBlocks, validateLessonForSave, replaceFormQuestions, validateFormForSave } from "@/lib/activity-helpers";
import { validateMemoryForSave } from "@/features/memory/memoryCards";
import { translateMessage } from "@/lib/i18n/translateMessage";
import { replaceActivityAchievements } from "@/features/gamification/activityAchievements";
import { message } from "@/lib/i18n/message";

export async function updateActivityForUser(user: ActivityWriter, data: UpdateActivityData): Promise<ActivityWriteResult> {
  if (data.type === "ludileccion") {
    const problem = validateLessonForSave(data.lessonBlocks, data.config.gradeId);
    if (problem) return { error: await translateMessage(problem), status: 400 };
  }

  if (data.type === "ludiform") {
    const problem = validateFormForSave(data.formQuestions, data.config.gradeId);
    if (problem) return { error: await translateMessage(problem), status: 400 };
  }

  if (data.type === "ludimemory") {
    const problem = validateMemoryForSave(data.memoryImages);
    if (problem) return { error: await translateMessage(problem), status: 400 };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify ownership and existence
      const existingActivity = await tx.ludiActividad.findUnique({
        where: { activityId: data.activityId }
      });

      if (!existingActivity) {
        throw new ActivityWriteError("Errors.activityNotFound", 404);
      }

      if (existingActivity.userId !== user.id) {
        throw new ActivityWriteError("Errors.editForbidden", 403);
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
      const ajustesJson = JSON.stringify({
        voiceEnabled: data.config.voiceEnabled,
        speedBonus: data.config.speedBonus ?? true,
        backgroundImage: data.backgroundImage
      });
      await tx.ludiActividadConfig.upsert({
        where: { activityId: data.activityId },
        update: {
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson
        },
        create: {
          activity: { connect: { activityId: data.activityId } },
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson
        }
      });
      await replaceActivityAchievements(tx, data.activityId, data.config.selectedBadges, data.config.selectedMissions);

      // 5. Smart Content Update
      if (data.type === 'ludileccion') {
          await replaceLessonBlocks(tx, data.activityId, tipoActividadId, data.lessonBlocks ?? []);
      } else if (data.type === 'ludiform') {
          await replaceFormQuestions(tx, data.activityId, tipoActividadId, data.formQuestions ?? [], data.config.pointsPerCorrect);
      } else if (data.type === 'ludimemory' && data.memoryImages) {
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

              // 3. Clear Options (and their images)
              await tx.ludiOpcionRecurso.deleteMany({ where: { opcion: { preguntaId: { in: qIds } } } });
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
                          esContenido: Boolean(q.isSlide),
                          puntaje: q.isSlide ? null : data.config.pointsPerCorrect,
                          tiempoLimiteMs: q.isSlide ? null : data.config.timeLimit * 1000
                      }
                  });

                  if (q.isSlide) {
                      await tx.ludiOpcion.deleteMany({ where: { preguntaId: updatedQuestion.id } });
                  } else if ('answers' in q) {
                      const quizQ = q as LudiQuizQuestion;
                      const incomingOptionIds = quizQ.answers.map(a => a.id).filter(id => id && id > 100);

                      // Safely delete options by clearing related student answers first (in case CASCADE is missing)
                      const optionsToDelete = await tx.ludiOpcion.findMany({
                          where: { preguntaId: updatedQuestion.id, id: { notIn: incomingOptionIds as any } }
                      });

                      if (optionsToDelete.length > 0) {
                          const optIds = optionsToDelete.map(o => o.id);
                          await tx.ludiRespuestaEstudiante.deleteMany({ where: { opcionId: { in: optIds } } });
                          await tx.ludiOpcionRecurso.deleteMany({ where: { opcionId: { in: optIds } } });
                          await tx.ludiOpcion.deleteMany({
                              where: { id: { in: optIds } }
                          });
                      }

                      for (const ans of quizQ.answers) {
                          const opcion = ans.id && ans.id > 100
                              ? await tx.ludiOpcion.update({
                                  where: { id: BigInt(ans.id) },
                                  data: { texto: ans.text, esCorrecta: ans.isCorrect }
                              })
                              : await tx.ludiOpcion.create({
                                  data: { preguntaId: updatedQuestion.id, indice: ans.id, texto: ans.text, esCorrecta: ans.isCorrect }
                              });
                          await setOptionImage(tx, opcion.id, ans.imageUrl);
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
                          esContenido: Boolean(q.isSlide),
                          puntaje: q.isSlide ? null : data.config.pointsPerCorrect,
                          tiempoLimiteMs: q.isSlide ? null : data.config.timeLimit * 1000
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

                  if (q.isSlide) {
                      // Sin opciones: la diapositiva no se responde.
                  } else if ('answers' in q) {
                      for (const ans of (q as LudiQuizQuestion).answers) {
                          const opcion = await tx.ludiOpcion.create({
                              data: { preguntaId: newQuestion.id, indice: ans.id, texto: ans.text, esCorrecta: ans.isCorrect }
                          });
                          await setOptionImage(tx, opcion.id, ans.imageUrl);
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

  } catch (error) {
    // El detalle de la BD queda en el log; al usuario no se le muestra.
    console.error("Error updating activity:", error);
    const known = error instanceof ActivityWriteError;
    return {
      error: await translateMessage(message(known ? error.messageKey : "Errors.updateFailed")),
      status: known ? error.status : 500,
    };
  }
}
