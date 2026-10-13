"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { getTranslations } from "next-intl/server";

export async function cloneTemplateActivity(templateActivityId: number) {
  try {
    const user = await getCurrentUser();
    const t = await getTranslations("Errors");
    if (!user) return { success: false, error: t("unauthorized") };
    const newUserId = user.id;

    // 1. Fetch the full template with all nested data
    const template = await prisma.ludiActividad.findFirst({
      where: { activityId: templateActivityId, activity: { isTemplate: true } as any },
      include: {
        activity: true,
        config: true,
        preguntas: {
          include: {
            opciones: { include: { opcionRecursos: { include: { recurso: true } } } },
            preguntaRecursos: { include: { recurso: true } }
          }
        },
        memoriaParejas: {
          include: {
            tarjetas: { include: { recurso: true } }
          }
        },
        insignias: true,
        misiones: true
      }
    }) as any;

    if (!template) {
      return { success: false, error: t("templateNotFound") };
    }

    // 2. Clone using a transaction
    const newActivityId = await prisma.$transaction(async (tx) => {
      // Create new base ACTIVITY (Copia)
      const newActivityBase = await tx.aCTIVITY.create({
        data: {
          activity_name: `${template.activity.activity_name} (Mi Copia)`,
          activity_desc: "Clonado desde plantilla",
          image_url: template.activity.image_url,
          isTemplate: false, // The clone is NOT a template
        }
      });

      // Force isTemplate to 0 to bypass Prisma SQL Server BIT column issues
      await tx.$executeRaw`UPDATE ACTIVITY SET isTemplate = 0 WHERE id = ${newActivityBase.id}`;

      // Create new LudiActividad linked to the user
      await tx.ludiActividad.create({
        data: {
          activity: {
            connect: { id: newActivityBase.id }
          },
          tipoActividad: {
            connect: { id: template.tipoActividadId }
          },
          user: {
            connect: { id: newUserId }
          },
          grado: template.gradoId ? {
            connect: { id: template.gradoId }
          } : undefined,
          tema: template.temaId ? {
            connect: { id: template.temaId }
          } : undefined,
          publico: false,
          estatus: true,
          // Agrupa en el seguimiento las copias de una misma plantilla hechas por distintos docentes.
          plantillaOrigen: {
            connect: { activityId: template.activityId }
          },
        }
      });

      // Copy Configuration
      if (template.config) {
        const configData: any = {
            activity: { connect: { activityId: newActivityBase.id } },
            tiempoPreguntaMs: template.config.tiempoPreguntaMs,
            tipoPuntuacion: { connect: { id: template.config.tipoPuntuacionId } },
            puntajeBase: template.config.puntajeBase,
            ajustesJson: template.config.ajustesJson,
        };

        if (template.config.feedbackId) {
            configData.feedback = { connect: { id: template.config.feedbackId } };
        }

        await tx.ludiActividadConfig.create({
          data: configData
        });
      }

      if (template.insignias.length > 0) {
        await tx.ludiActividadInsignia.createMany({
          data: template.insignias.map((row: { insigniaId: number }) => ({ activityId: newActivityBase.id, insigniaId: row.insigniaId }))
        });
      }
      if (template.misiones.length > 0) {
        await tx.ludiActividadMision.createMany({
          data: template.misiones.map((row: { misionId: number }) => ({ activityId: newActivityBase.id, misionId: row.misionId }))
        });
      }

      // Copy Questions and Options (For Quiz & True/False)
      for (const tPregunta of template.preguntas) {
        const newPregunta = await tx.ludiPregunta.create({
          data: {
            activity: {
                connect: { activityId: newActivityBase.id }
            },
            numero: tPregunta.numero,
            tipoActividad: {
                connect: { id: tPregunta.tipoActividadId }
            },
            enunciado: tPregunta.enunciado,
            tiempoLimiteMs: tPregunta.tiempoLimiteMs,
            puntaje: tPregunta.puntaje,
            activo: tPregunta.activo,
            esContenido: tPregunta.esContenido,
            contenidoTexto: tPregunta.contenidoTexto,
            tipoPregunta: tPregunta.tipoPregunta,
          }
        });

        // Copy Options
        if (tPregunta.opciones.length > 0) {
          for (const opt of tPregunta.opciones) {
              const newOpcion = await tx.ludiOpcion.create({
                  data: {
                      pregunta: { connect: { id: newPregunta.id } },
                      indice: opt.indice,
                      texto: opt.texto,
                      esCorrecta: opt.esCorrecta || opt.es_correcta
                  }
              });
              // La copia reutiliza el mismo recurso de imagen de la plantilla.
              for (const opcionRecurso of opt.opcionRecursos) {
                  await tx.ludiOpcionRecurso.create({
                      data: {
                          opcion: { connect: { id: newOpcion.id } },
                          recurso: { connect: { id: opcionRecurso.recursoId } },
                          rol: opcionRecurso.rol
                      }
                  });
              }
          }
        }

        // Copy Resources linked to question (Images, Youtube)
        if (tPregunta.preguntaRecursos.length > 0) {
            for (const pRecurso of tPregunta.preguntaRecursos) {
                await tx.ludiPreguntaRecurso.create({
                    data: {
                        pregunta: { connect: { id: newPregunta.id } },
                        recurso: { connect: { id: pRecurso.recursoId } },
                        rol: pRecurso.rol
                    }
                });
            }
        }
      }

      // Copy Memory Pairs (if any)
      for (const tPareja of template.memoriaParejas) {
        const newPareja = await tx.ludiMemoriaPareja.create({
            data: {
                activity: { connect: { activityId: newActivityBase.id } },
                etiqueta: tPareja.etiqueta,
            }
        });

        if (tPareja.tarjetas.length > 0) {
            for (const tTarjeta of tPareja.tarjetas) {
                await tx.ludiMemoriaTarjeta.create({
                    data: {
                        pareja: { connect: { id: newPareja.id } },
                        recurso: { connect: { id: tTarjeta.recursoId } },
                        lado: tTarjeta.lado
                    }
                });
            }
        }
      }

      return newActivityBase.id;
    });

    revalidatePath("/dashboard/templates");
    revalidatePath("/dashboard/my-activities");

    return { success: true, newActivityId };

  } catch (error) {
    console.error("Error cloning template:", error);
    return { success: false, error: (await getTranslations("Errors"))("cloneFailed") };
  }
}