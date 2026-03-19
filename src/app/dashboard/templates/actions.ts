"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function cloneTemplateActivity(templateActivityId: number, newUserId: string) {
  try {
    // 1. Fetch the full template with all nested data
    const template = await prisma.ludiActividad.findFirst({
      where: { activityId: templateActivityId, activity: { isTemplate: true } as any },
      include: {
        activity: true,
        config: true,
        preguntas: {
          include: {
            opciones: true,
            preguntaRecursos: { include: { recurso: true } }
          }
        },
        memoriaParejas: {
          include: {
            tarjetas: { include: { recurso: true } }
          }
        }
      }
    }) as any;

    if (!template) {
      return { success: false, error: "Plantilla no encontrada." };
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
        } as any
      });

      // Create new LudiActividad linked to the user
      await tx.ludiActividad.create({
        data: {
          activityId: newActivityBase.id,
          tipoActividadId: template.tipoActividadId,
          userId: newUserId,
          gradoId: template.gradoId,
          temaId: template.temaId,
          publico: false,
          estatus: true,
        }
      });

      // Copy Configuration
      if (template.config) {
        await tx.ludiActividadConfig.create({
          data: {
            activityId: newActivityBase.id,
            tiempoPreguntaMs: template.config.tiempoPreguntaMs,
            tipoPuntuacionId: template.config.tipoPuntuacionId,
            puntajeBase: template.config.puntajeBase,
            feedbackId: template.config.feedbackId,
            ajustesJson: template.config.ajustesJson,
          }
        });
      }

      // Copy Questions and Options (For Quiz & True/False)
      for (const tPregunta of template.preguntas) {
        const newPregunta = await tx.ludiPregunta.create({
          data: {
            activityId: newActivityBase.id,
            numero: tPregunta.numero,
            tipoActividadId: tPregunta.tipoActividadId,
            enunciado: tPregunta.enunciado,
            tiempoLimiteMs: tPregunta.tiempoLimiteMs,
            puntaje: tPregunta.puntaje,
            activo: tPregunta.activo,
          }
        });

        // Copy Options
        if (tPregunta.opciones.length > 0) {
          await tx.ludiOpcion.createMany({
            data: tPregunta.opciones.map((opt: any) => ({
              preguntaId: newPregunta.id,
              indice: opt.indice,
              texto: opt.texto,
              esCorrecta: opt.esCorrecta
            }))
          });
        }

        // Copy Resources linked to question (Images, Youtube)
        if (tPregunta.preguntaRecursos.length > 0) {
            for (const pRecurso of tPregunta.preguntaRecursos) {
                // To keep it simple and avoid duplicating physical files or confusing externalIds,
                // we just link to the SAME existing Resource ID. 
                // A resource (LudiRecurso) is technically independent of the question.
                await tx.ludiPreguntaRecurso.create({
                    data: {
                        preguntaId: newPregunta.id,
                        recursoId: pRecurso.recursoId,
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
                activityId: newActivityBase.id,
                etiqueta: tPareja.etiqueta,
            }
        });
        
        if (tPareja.tarjetas.length > 0) {
            for (const tTarjeta of tPareja.tarjetas) {
                await tx.ludiMemoriaTarjeta.create({
                    data: {
                        parejaId: newPareja.id,
                        recursoId: tTarjeta.recursoId,
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
    return { success: false, error: "Ocurrió un error al copiar la plantilla de la base de datos." };
  }
}