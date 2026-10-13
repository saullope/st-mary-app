// Catálogo de insignias y misiones tal como llega de la base de datos
// (LUDI_INSIGNIA, LUDI_MISION). Sin textos: se traducen con useAchievementText.
// Sin dependencias de servidor para usarse también en el navegador.

/** Cada tipo de actividad se premia con su propio catálogo; LudiQuiz y Verdadero/Falso comparten el de juego. */
export type AchievementCatalogKey = "quiz" | "lesson" | "form" | "memory";

export interface BadgeDef {
  code: string;
  catalog: AchievementCatalogKey;
  /** Regla que la otorga (ver achievementRules.ts). */
  rule: string;
  /** Parámetro de la regla: segundos, palabras o porcentaje, según la regla. */
  threshold: number | null;
  img: string;
  color: string;
}

export interface MissionDef {
  code: string;
  catalog: AchievementCatalogKey;
  gradeId: number;
  rule: string;
  threshold: number | null;
}

export interface AchievementCatalog {
  badges: BadgeDef[];
  missions: MissionDef[];
}

export const EMPTY_CATALOG: AchievementCatalog = { badges: [], missions: [] };

/** Columnas de LUDI_INSIGNIA que necesita la app. */
export interface BadgeRow {
  codigo: string;
  catalogo: string;
  regla: string;
  umbral: number | null;
  imagen: string;
  color: string;
}

/** Columnas de LUDI_MISION que necesita la app. */
export interface MissionRow {
  codigo: string;
  catalogo: string;
  gradoId: number;
  regla: string;
  umbral: number | null;
}

export const toBadgeDef = (row: BadgeRow): BadgeDef => ({
  code: row.codigo,
  catalog: row.catalogo as AchievementCatalogKey,
  rule: row.regla,
  threshold: row.umbral,
  img: row.imagen,
  color: row.color,
});

export const toMissionDef = (row: MissionRow): MissionDef => ({
  code: row.codigo,
  catalog: row.catalogo as AchievementCatalogKey,
  gradeId: row.gradoId,
  rule: row.regla,
  threshold: row.umbral,
});

const CATALOG_BY_ACTIVITY: Record<string, AchievementCatalogKey> = {
  ludiquiz: "quiz",
  trueorfalse: "quiz",
  ludimemory: "memory",
  ludileccion: "lesson",
  ludiform: "form",
};

// Deben coincidir con ACTIVITY_TYPE_MAP en src/lib/activity-helpers.ts
const CATALOG_BY_TIPO: Record<number, AchievementCatalogKey> = { 1: "quiz", 2: "quiz", 3: "memory", 4: "lesson", 5: "form" };

/** Catálogo del editor, a partir del tipo de actividad que se edita. */
export function catalogKeyForActivity(activityType: string | null): AchievementCatalogKey {
  return (activityType && CATALOG_BY_ACTIVITY[activityType]) || "quiz";
}

/** Catálogo del reproductor, a partir de LudiActividad.tipoActividadId. */
export function catalogKeyForTipo(tipoActividadId: number | string): AchievementCatalogKey {
  return CATALOG_BY_TIPO[Number(tipoActividadId)] ?? "quiz";
}

export function badgesFor(catalog: AchievementCatalog, key: AchievementCatalogKey): BadgeDef[] {
  return catalog.badges.filter((b) => b.catalog === key);
}

export function missionsFor(catalog: AchievementCatalog, key: AchievementCatalogKey, gradeId: number): MissionDef[] {
  return catalog.missions.filter((m) => m.catalog === key && m.gradeId === gradeId);
}

/** Búsqueda por código en todo el catálogo (reportes, caja sorpresa, avisos). */
export function findBadge(catalog: AchievementCatalog, code: string): BadgeDef | undefined {
  return catalog.badges.find((b) => b.code === code);
}

export function findMission(catalog: AchievementCatalog, code: string): MissionDef | undefined {
  return catalog.missions.find((m) => m.code === code);
}

/** Definiciones que eligió el docente, en el orden del catálogo; ignora códigos que ya no existen. */
export function pickSelected<T extends { code: string }>(defs: T[], codes: string[]): T[] {
  return defs.filter((d) => codes.includes(d.code));
}
