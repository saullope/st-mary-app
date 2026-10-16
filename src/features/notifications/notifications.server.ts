// Crea, actualiza y retira las notificaciones del panel docente. Se llama desde el
// servidor justo donde ocurre cada hecho; un fallo aquí nunca debe romper ese flujo,
// por eso las funciones públicas registran el error y no lo propagan.
import prisma from "@/lib/db";
import { REVIEW_STATUS } from "@/features/form/formQuestions";
import {
  evaluationKey,
  parseData,
  parseMuted,
  reportLink,
  reviewKey,
  summaryKey,
  type NotificationData,
  type NotificationList,
  type NotificationType,
} from "./notificationTypes";

const LIST_LIMIT = 20;

interface NotificationInput {
  type: NotificationType;
  key: string;
  data: NotificationData;
  link: string | null;
}

async function upsertNotification(userId: string, { type, key, data, link }: NotificationInput) {
  if ((await getMutedTypes(userId)).includes(type)) return;
  const now = new Date();
  const values = { tipo: type, datos: JSON.stringify(data), enlace: link, leida: false, actualizadaEn: now };
  await prisma.ludiNotificacion.upsert({
    where: { userId_clave: { userId, clave: key } },
    update: values,
    create: { userId, clave: key, ...values, creadaEn: now },
  });
}

const dismissNotification = (userId: string, key: string) =>
  prisma.ludiNotificacion.deleteMany({ where: { userId, clave: key } });

async function safely(label: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.error(`Notification (${label}) failed:`, error);
  }
}

async function sessionContext(sessionId: bigint) {
  return prisma.lUDI_SESION.findUnique({
    where: { id: sessionId },
    select: {
      userId: true,
      teacherRating: true,
      LUDI_ACTIVIDAD: { select: { activity: { select: { activity_name: true } } } },
    },
  });
}

/** Respuestas largas de LudiForm por calificar en una sesión: un aviso con el total, o ninguno. */
export function syncPendingReviews(sessionId: bigint) {
  return safely("review_pending", async () => {
    const session = await sessionContext(sessionId);
    if (!session) return;
    const count = await prisma.ludiRespuestaEstudiante.count({
      where: { estadoRevision: REVIEW_STATUS.pending, participante: { sesion_id: sessionId } },
    });
    if (count === 0) {
      await dismissNotification(session.userId, reviewKey(sessionId));
      return;
    }
    await upsertNotification(session.userId, {
      type: "review_pending",
      key: reviewKey(sessionId),
      data: { activity: session.LUDI_ACTIVIDAD.activity.activity_name, count },
      link: reportLink(sessionId),
    });
  });
}

/** Al terminar una sesión en vivo: el resumen y, si falta, el pedido de evaluación. */
export function notifySessionFinished(sessionId: bigint) {
  return safely("session_finished", async () => {
    const session = await sessionContext(sessionId);
    if (!session) return;
    const activity = session.LUDI_ACTIVIDAD.activity.activity_name;

    const [stats, badges, config] = await Promise.all([
      prisma.lUDI_SESION_PARTICIPANTE.aggregate({
        where: { sesion_id: sessionId },
        _count: { _all: true },
        _avg: { puntaje_total: true },
      }),
      prisma.ludiParticipanteInsignia.count({ where: { participante: { sesion_id: sessionId } } }),
      prisma.ludiUserConfig.findUnique({ where: { userId: session.userId }, select: { enableTeacherEvaluation: true } }),
    ]);

    const participants = stats._count._all;
    // Una sesión que nadie jugó no deja nada que resumir ni evaluar.
    if (participants === 0) return;

    await upsertNotification(session.userId, {
      type: "session_summary",
      key: summaryKey(sessionId),
      data: { activity, participants, average: Math.round(stats._avg.puntaje_total ?? 0), badges },
      link: reportLink(sessionId),
    });

    if (session.teacherRating === null && config?.enableTeacherEvaluation !== false) {
      await upsertNotification(session.userId, {
        type: "evaluation_pending",
        key: evaluationKey(sessionId),
        data: { activity },
        link: reportLink(sessionId),
      });
    }
  });
}

/** La evaluación ya se respondió: el pedido deja de tener sentido. */
export function resolveEvaluation(userId: string, sessionId: bigint) {
  return safely("evaluation_pending", () => dismissNotification(userId, evaluationKey(sessionId)));
}

export async function getMutedTypes(userId: string): Promise<NotificationType[]> {
  const config = await prisma.ludiUserConfig.findUnique({ where: { userId }, select: { mutedNotifications: true } });
  return parseMuted(config?.mutedNotifications);
}

export async function listNotifications(userId: string): Promise<NotificationList> {
  // Apagar un tipo también oculta los avisos de ese tipo que ya existían.
  const where = { userId, tipo: { notIn: await getMutedTypes(userId) } };
  const [rows, unread] = await Promise.all([
    prisma.ludiNotificacion.findMany({ where, orderBy: { actualizadaEn: "desc" }, take: LIST_LIMIT }),
    prisma.ludiNotificacion.count({ where: { ...where, leida: false } }),
  ]);
  return {
    unread,
    items: rows.map((row) => ({
      id: row.id.toString(),
      type: row.tipo as NotificationType,
      data: parseData(row.datos),
      link: row.enlace,
      read: row.leida,
      updatedAt: row.actualizadaEn.toISOString(),
    })),
  };
}

/** Marca como leídas las indicadas (solo del propio usuario) o todas. */
export async function markNotificationsRead(userId: string, ids: string[] | "all") {
  await prisma.ludiNotificacion.updateMany({
    where: { userId, leida: false, ...(ids === "all" ? {} : { id: { in: ids.map((id) => BigInt(id)) } }) },
    data: { leida: true },
  });
}
