// Lo que muestra /dashboard/templates: plantillas y colecciones de un grado, filtradas
// por las clases del docente, y qué plantillas ya guardó como copia.
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const TEMPLATE_TYPES = [1, 2, 3, 4, 5] as const;

export interface TemplateFilters {
  gradeId: number;
  /** Ids de LUDI_MATERIA; vacío = todas las clases. */
  subjectIds: number[];
  collection: string | null;
  typeId: number | null;
  search: string;
}

export interface TemplateCardData {
  activityId: number;
  typeId: number;
  gradeId: number | null;
  title: string;
  subjectCode: string | null;
  collectionName: string | null;
  coverUrl: string | null;
  coverCredit: string | null;
  durationMin: number | null;
  /** Preguntas, bloques o imágenes, según el tipo. */
  items: number;
  /** Segundos por pregunta; null en los tipos sin reloj. */
  secondsPerQuestion: number | null;
  badges: number;
  /** Copia que el docente ya guardó en Mis actividades. */
  copyId: number | null;
}

export interface CollectionCardData {
  code: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  subjectCode: string;
  templates: number;
}

const TIMED_TYPES = new Set([1, 2]);

export async function getTemplateCollections(gradeId: number, subjectIds: number[]): Promise<CollectionCardData[]> {
  const rows = await prisma.ludiPlantillaColeccion.findMany({
    where: { gradoId: gradeId, activo: true, ...(subjectIds.length > 0 ? { materiaId: { in: subjectIds } } : {}) },
    orderBy: [{ materia: { orden: "asc" } }, { orden: "asc" }],
    select: {
      codigo: true,
      nombre: true,
      descripcion: true,
      portadaUrl: true,
      materia: { select: { codigo: true } },
      _count: { select: { plantillas: { where: { actividad: { estatus: true } } } } },
    },
  });
  return rows
    .filter((row) => row._count.plantillas > 0)
    .map((row) => ({
      code: row.codigo,
      name: row.nombre,
      description: row.descripcion,
      coverUrl: row.portadaUrl,
      subjectCode: row.materia.codigo,
      templates: row._count.plantillas,
    }));
}

export async function getTemplates(userId: string, filters: TemplateFilters): Promise<TemplateCardData[]> {
  const plantilla: Prisma.LudiPlantillaWhereInput = {
    ...(filters.subjectIds.length > 0 ? { materiaId: { in: filters.subjectIds } } : {}),
    ...(filters.collection ? { coleccion: { codigo: filters.collection } } : {}),
  };
  const filtersPlantilla = Object.keys(plantilla).length > 0;

  const rows = await prisma.ludiActividad.findMany({
    where: {
      estatus: true,
      gradoId: filters.gradeId,
      activity: { isTemplate: true, ...(filters.search ? { activity_name: { contains: filters.search } } : {}) },
      ...(filters.typeId ? { tipoActividadId: filters.typeId } : {}),
      ...(filtersPlantilla ? { plantilla } : {}),
    },
    orderBy: [{ plantilla: { materia: { orden: "asc" } } }, { plantilla: { coleccion: { orden: "asc" } } }, { plantilla: { orden: "asc" } }, { activity: { activity_name: "asc" } }],
    select: {
      activityId: true,
      tipoActividadId: true,
      gradoId: true,
      activity: { select: { activity_name: true } },
      config: { select: { tiempoPreguntaMs: true } },
      plantilla: {
        select: {
          portadaUrl: true,
          portadaCredito: true,
          duracionMin: true,
          materia: { select: { codigo: true } },
          coleccion: { select: { nombre: true } },
        },
      },
      _count: { select: { preguntas: { where: { activo: true } }, memoriaParejas: true, insignias: true } },
    },
  });

  const copies = await prisma.ludiActividad.findMany({
    where: { userId, estatus: true, plantillaOrigenId: { in: rows.map((row) => row.activityId) } },
    select: { activityId: true, plantillaOrigenId: true },
    orderBy: { activityId: "desc" },
  });
  const copyByTemplate = new Map<number, number>();
  for (const copy of copies) {
    if (copy.plantillaOrigenId !== null && !copyByTemplate.has(copy.plantillaOrigenId)) {
      copyByTemplate.set(copy.plantillaOrigenId, copy.activityId);
    }
  }

  return rows.map((row) => ({
    activityId: row.activityId,
    typeId: row.tipoActividadId,
    gradeId: row.gradoId,
    title: row.activity.activity_name,
    subjectCode: row.plantilla?.materia.codigo ?? null,
    collectionName: row.plantilla?.coleccion?.nombre ?? null,
    coverUrl: row.plantilla?.portadaUrl ?? null,
    coverCredit: row.plantilla?.portadaCredito ?? null,
    durationMin: row.plantilla?.duracionMin ?? null,
    items: row.tipoActividadId === 3 ? row._count.memoriaParejas : row._count.preguntas,
    secondsPerQuestion: TIMED_TYPES.has(row.tipoActividadId) && row.config?.tiempoPreguntaMs ? Math.round(row.config.tiempoPreguntaMs / 1000) : null,
    badges: row._count.insignias,
    copyId: copyByTemplate.get(row.activityId) ?? null,
  }));
}
