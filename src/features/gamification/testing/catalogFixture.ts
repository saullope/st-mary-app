// Catálogo de logros para pruebas, construido desde el mismo seed que llena la BD:
// así las pruebas de reglas usan los umbrales reales.
import { BADGES, MISSIONS } from "../../../../prisma/seeds/achievementCatalog";
import type { AchievementCatalog, AchievementCatalogKey, BadgeDef, MissionDef } from "../catalog";

export const testCatalog: AchievementCatalog = {
  badges: BADGES.map((b) => ({
    code: b.codigo,
    catalog: b.catalogo as AchievementCatalogKey,
    rule: b.regla,
    threshold: b.umbral ?? null,
    img: b.imagen,
    color: b.color,
  })),
  missions: MISSIONS.map((m) => ({
    code: m.codigo,
    catalog: m.catalogo as AchievementCatalogKey,
    gradeId: m.gradoId,
    rule: m.regla,
    threshold: m.umbral ?? null,
  })),
};

function pick<T extends { code: string }>(defs: T[], codes: string[]): T[] {
  return codes.map((code) => {
    const def = defs.find((d) => d.code === code);
    if (!def) throw new Error(`Código de logro desconocido en la prueba: ${code}`);
    return def;
  });
}

export const badgeDefs = (...codes: string[]): BadgeDef[] => pick(testCatalog.badges, codes);
export const missionDefs = (...codes: string[]): MissionDef[] => pick(testCatalog.missions, codes);
