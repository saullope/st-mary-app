import prisma from "@/lib/db";
import { sessionPhase } from "@/lib/play/sessionState";

// Una sesión que nadie terminó en un día ya no es "la de ahora": no se ofrece volver a ella.
const OPEN_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface OpenLiveSession {
  id: string;
  pin: string;
  activity: string;
  participants: number;
  active: boolean;
}

/** Sesiones en vivo del docente que siguen abiertas (esperando o en curso), la más reciente primero. */
export async function getOpenLiveSessions(userId: string): Promise<OpenLiveSession[]> {
  const rows = await prisma.lUDI_SESION.findMany({
    where: { userId, finalizada_en: null, creada_en: { gte: new Date(Date.now() - OPEN_WINDOW_MS) } },
    orderBy: { creada_en: "desc" },
    take: 5,
    select: {
      id: true,
      codigo: true,
      estado: true,
      LUDI_ACTIVIDAD: { select: { activity: { select: { activity_name: true } } } },
      _count: { select: { LUDI_SESION_PARTICIPANTE: true } },
    },
  });
  return rows
    .filter((row) => sessionPhase(row.estado) !== "finished")
    .map((row) => ({
      id: row.id.toString(),
      pin: row.codigo,
      activity: row.LUDI_ACTIVIDAD.activity.activity_name,
      participants: row._count.LUDI_SESION_PARTICIPANTE,
      active: sessionPhase(row.estado) === "active",
    }));
}
