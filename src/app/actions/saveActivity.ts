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
  backgroundImage?: string;
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
      
      // Intentar obtener el tema por el fondo seleccionado. Si no existe, usamos el primer tema activo por defecto.
      let temaId = data.backgroundImage ? await getThemeIdByUrl(data.backgroundImage) : null;
      if (!temaId) {
         const firstActiveTheme = await tx.ludiTema.findFirst({ where: { activo: true } });
         temaId = firstActiveTheme ? Number(firstActiveTheme.id) : 1; // Fallback a 1 si no hay temas activos
      }

      // 2. Crear Actividad Base
      const legacyActivity = await tx.aCTIVITY.create({
        data: {
          activity_name: data.title,
          activity_desc: "Creada con LudiMaker",
          created_date: new Date(),
          modified_date: new Date()
        } as any
      });

      // 3. Crear LudiActividad
      const ludiActivity = await tx.ludiActividad.create({
        data: {
          activity: {
            connect: { id: legacyActivity.id }
          },
          tipoActividad: {
            connect: { id: tipoActividadId }
          },
          user: {
            connect: { id: user.id }
          },
          grado: data.config.gradeId ? {
            connect: { id: data.config.gradeId }
          } : undefined,
          tema: {
            connect: { id: BigInt(temaId) }
          },
          publico: false,
          estatus: true
        }
      });

      // 4. Crear Configuración
      await tx.ludiActividadConfig.create({
        data: {
          activity: {
            connect: { activityId: ludiActivity.activityId }
          },
          puntajeBase: data.config.pointsPerCorrect,
          tiempoPreguntaMs: data.config.timeLimit * 1000,
          ajustesJson: JSON.stringify({
            badges: data.config.selectedBadges,
            missions: data.config.selectedMissions,
            backgroundImage: data.backgroundImage
          })
        }
      });

      // 5. Crear Contenido (Preguntas o Memory)
      if (data.type === 'ludimemory' && data.memoryImages) {
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
        let i = 1;
        for (const q of data.questions) {
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
                    data: {
                        pregunta: { connect: { id: newQuestion.id } },
                        indice: ans.id,
                        texto: ans.text,
                        esCorrecta: ans.isCorrect
                    }
                });
             }
          } else {
             const tfQ = q as TrueOrFalseQuestion;
             await tx.ludiOpcion.create({
                data: {
                    pregunta: { connect: { id: newQuestion.id } },
                    indice: 1,
                    texto: "Verdadero",
                    esCorrecta: tfQ.correctAnswer === "true"
                }
             });
             await tx.ludiOpcion.create({
                data: {
                    pregunta: { connect: { id: newQuestion.id } },
                    indice: 2,
                    texto: "Falso",
                    esCorrecta: tfQ.correctAnswer === "false"
                }
             });
          }
          i++;
        }
      }

      return ludiActivity;
    });

    return { 
        success: true, 
        message: "Actividad guardada exitosamente", 
        activityId: result.activityId
    };

  } catch (error: any) {
    console.error("Error saving activity:", error);
    return { error: "Error al guardar en base de datos: " + error.message };
  }
}
