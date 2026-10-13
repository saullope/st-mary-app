import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import { toBadgeDef, toMissionDef, type AchievementCatalog } from "./catalog";

export const ACHIEVEMENT_CATALOG_TAG = "achievement-catalog";

/**
 * Catálogo activo de insignias y misiones. Cambia muy poco y se lee en cada partida,
 * así que se cachea; tras editarlo en la BD, revalidateTag(ACHIEVEMENT_CATALOG_TAG).
 */
export const getAchievementCatalog = unstable_cache(
  async (): Promise<AchievementCatalog> => {
    const [badges, missions] = await Promise.all([
      prisma.ludiInsignia.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
      prisma.ludiMision.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
    ]);
    return { badges: badges.map(toBadgeDef), missions: missions.map(toMissionDef) };
  },
  [ACHIEVEMENT_CATALOG_TAG],
  { tags: [ACHIEVEMENT_CATALOG_TAG], revalidate: 3600 }
);
