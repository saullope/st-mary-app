"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { REVIEW_STATUS } from "@/features/form/formQuestions";

const DEFAULT_BASE_POINTS = 10;

/**
 * El docente califica una respuesta escrita de LudiForm. Ajusta el puntaje del
 * participante por la diferencia, así que cambiar la calificación es idempotente.
 */
export async function reviewWrittenAnswer(respuestaId: number, approved: boolean) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado. Debes iniciar sesión." };
  if (!Number.isInteger(respuestaId) || respuestaId <= 0 || typeof approved !== "boolean") {
    return { error: "Datos inválidos." };
  }

  const respuesta = await prisma.ludiRespuestaEstudiante.findUnique({
    where: { id: respuestaId },
    include: {
      pregunta: { include: { activity: { include: { config: true } } } },
      participante: { include: { LUDI_SESION: true } },
    },
  });

  if (!respuesta || respuesta.pregunta.tipoPregunta !== "long") {
    return { error: "Respuesta no encontrada." };
  }
  if (respuesta.participante.LUDI_SESION.userId !== user.id) {
    return { error: "No tienes permiso para calificar esta respuesta." };
  }

  const points = respuesta.pregunta.puntaje ?? respuesta.pregunta.activity.config?.puntajeBase ?? DEFAULT_BASE_POINTS;
  const newScore = approved ? points : 0;
  const delta = newScore - respuesta.puntajeObtenido;

  await prisma.$transaction([
    prisma.ludiRespuestaEstudiante.update({
      where: { id: respuestaId },
      data: { esCorrecta: approved, puntajeObtenido: newScore, estadoRevision: REVIEW_STATUS.reviewed },
    }),
    prisma.lUDI_SESION_PARTICIPANTE.update({
      where: { id: respuesta.participanteId },
      data: { puntaje_total: { increment: delta } },
    }),
  ]);

  revalidatePath(`/dashboard/reports/${respuesta.participante.sesion_id.toString()}`);
  return { success: true, esCorrecta: approved, puntajeObtenido: newScore };
}
