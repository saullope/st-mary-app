import type { Prisma } from "@prisma/client";

/**
 * Reemplaza las insignias y misiones elegidas para una actividad
 * (LUDI_ACTIVIDAD_INSIGNIA / LUDI_ACTIVIDAD_MISION). El editor trabaja con
 * códigos; aquí se traducen a las filas del catálogo y se rechaza cualquier
 * código que no exista, para no guardar una selección a medias.
 */
export async function replaceActivityAchievements(
  tx: Prisma.TransactionClient,
  activityId: number,
  badgeCodes: string[],
  missionCodes: string[]
) {
  const badgeSet = [...new Set(badgeCodes)];
  const missionSet = [...new Set(missionCodes)];
  const badges = await tx.ludiInsignia.findMany({ where: { codigo: { in: badgeSet } }, select: { id: true } });
  const missions = await tx.ludiMision.findMany({ where: { codigo: { in: missionSet } }, select: { id: true } });
  if (badges.length !== badgeSet.length || missions.length !== missionSet.length) {
    throw new Error("La actividad tiene insignias o misiones que no están en el catálogo.");
  }

  await tx.ludiActividadInsignia.deleteMany({ where: { activityId } });
  await tx.ludiActividadMision.deleteMany({ where: { activityId } });
  if (badges.length > 0) {
    await tx.ludiActividadInsignia.createMany({ data: badges.map((b) => ({ activityId, insigniaId: b.id })) });
  }
  if (missions.length > 0) {
    await tx.ludiActividadMision.createMany({ data: missions.map((m) => ({ activityId, misionId: m.id })) });
  }
}

/** Include de Prisma con los códigos elegidos; misma forma que arma buildPreviewSession. */
export const ACTIVITY_ACHIEVEMENTS_INCLUDE = {
  insignias: { select: { insignia: { select: { codigo: true } } } },
  misiones: { select: { mision: { select: { codigo: true } } } },
} as const;

export interface ActivityAchievementRows {
  insignias?: { insignia: { codigo: string } }[];
  misiones?: { mision: { codigo: string } }[];
}

export function selectedAchievementCodes(activity: ActivityAchievementRows) {
  return {
    badges: (activity.insignias ?? []).map((row) => row.insignia.codigo),
    missions: (activity.misiones ?? []).map((row) => row.mision.codigo),
  };
}
