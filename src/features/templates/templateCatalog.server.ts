// Carga el catálogo de plantillas (catalog/*.json) en la base. Lo ejecuta un administrador
// desde Configuración > Administración. Cada plantilla pasa por createActivityForUser /
// updateActivityForUser, los mismos servicios y validaciones que el editor.
import { createHash } from "crypto";
import prisma from "@/lib/db";
import { createActivityForUser } from "@/services/activityWrite/createActivity";
import { updateActivityForUser } from "@/services/activityWrite/updateActivity";
import {
  catalogCollectionSchema,
  catalogTemplateSchema,
  isResolved,
  templateMedia,
  toActivityData,
  type CatalogCollection,
  type CatalogTemplate,
} from "./catalogSchema";
import { catalogCollections, catalogTemplates } from "./catalog";

// Cambiar la configuración lúdica de levelConfig debe volver a escribir todas las plantillas.
const CONFIG_VERSION = "1";

export interface CatalogSyncReport {
  created: string[];
  updated: string[];
  unchanged: string[];
  retired: string[];
  /** Plantillas que no se cargaron, con el motivo. */
  failed: { code: string; reason: string }[];
}

const fingerprint = (entry: unknown) => createHash("sha256").update(CONFIG_VERSION + JSON.stringify(entry)).digest("hex");

async function subjectIds(): Promise<Map<string, number>> {
  const rows = await prisma.ludiMateria.findMany({ select: { id: true, codigo: true } });
  return new Map(rows.map((row) => [row.codigo, row.id]));
}

async function syncCollections(entries: CatalogCollection[], subjects: Map<string, number>, report: CatalogSyncReport) {
  const ids = new Map<string, number>();
  for (const entry of entries) {
    const materiaId = subjects.get(entry.subject);
    if (!materiaId) {
      report.failed.push({ code: entry.code, reason: `unknown subject ${entry.subject}` });
      continue;
    }
    const data = {
      gradoId: entry.grade,
      materiaId,
      nombre: entry.name,
      descripcion: entry.description,
      portadaUrl: entry.cover.url ?? null,
      portadaCredito: entry.cover.credit ?? null,
      orden: entry.order,
      activo: true,
    };
    const row = await prisma.ludiPlantillaColeccion.upsert({
      where: { codigo: entry.code },
      update: data,
      create: { codigo: entry.code, ...data },
    });
    ids.set(entry.code, row.id);
  }
  return ids;
}

/** Los créditos de Pixabay, Unsplash y YouTube quedan en el recurso que se muestra. */
async function saveCredits(entry: CatalogTemplate) {
  for (const item of templateMedia(entry)) {
    if (item.url && item.credit) {
      await prisma.ludiRecurso.updateMany({ where: { url: item.url }, data: { creditos: item.credit, titulo: item.query } });
    }
  }
}

async function syncTemplate(
  entry: CatalogTemplate,
  ownerId: string,
  subjects: Map<string, number>,
  collections: Map<string, number>,
  report: CatalogSyncReport,
) {
  const materiaId = subjects.get(entry.subject);
  if (!materiaId) return report.failed.push({ code: entry.code, reason: `unknown subject ${entry.subject}` });
  const pending = templateMedia(entry).filter((item) => !isResolved(item));
  if (pending.length > 0) return report.failed.push({ code: entry.code, reason: `${pending.length} media without url (run resolve-media)` });

  const version = fingerprint(entry);
  const existing = await prisma.ludiPlantilla.findUnique({
    where: { codigo: entry.code },
    select: { activityId: true, version: true, actividad: { select: { userId: true } } },
  });
  if (existing?.version === version) return report.unchanged.push(entry.code);

  const data = toActivityData(entry);
  const result = existing
    ? await updateActivityForUser({ id: existing.actividad.userId }, { ...data, activityId: existing.activityId })
    : await createActivityForUser({ id: ownerId }, data);
  if (!("success" in result)) return report.failed.push({ code: entry.code, reason: result.error });

  const activityId = result.activityId;
  // Prisma no escribe bien este BIT heredado en SQL Server (ver cloneTemplate en templates/actions.ts).
  await prisma.$executeRaw`UPDATE ACTIVITY SET isTemplate = 1 WHERE id = ${activityId}`;
  await prisma.ludiActividad.update({ where: { activityId }, data: { estatus: true } });
  const plantilla = {
    materiaId,
    coleccionId: collections.get(entry.collection) ?? null,
    orden: entry.order,
    portadaUrl: entry.cover.url ?? null,
    portadaCredito: entry.cover.credit ?? null,
    duracionMin: entry.durationMin,
    version,
  };
  await prisma.ludiPlantilla.upsert({
    where: { activityId },
    update: { codigo: entry.code, ...plantilla },
    create: { activityId, codigo: entry.code, ...plantilla },
  });
  await saveCredits(entry);
  (existing ? report.updated : report.created).push(entry.code);
}

/** Valida y escribe todo el catálogo. ownerId: el administrador que lo ejecuta (dueño de las nuevas). */
export async function syncTemplateCatalog(ownerId: string): Promise<CatalogSyncReport> {
  const report: CatalogSyncReport = { created: [], updated: [], unchanged: [], retired: [], failed: [] };
  const subjects = await subjectIds();

  const collections: CatalogCollection[] = [];
  for (const raw of catalogCollections) {
    try {
      collections.push((await catalogCollectionSchema.validate(raw, { abortEarly: true })) as CatalogCollection);
    } catch (error) {
      report.failed.push({ code: (raw as { code?: string }).code ?? "?", reason: (error as Error).message });
    }
  }
  const collectionIds = await syncCollections(collections, subjects, report);

  // Los códigos salen de los archivos tal cual: una plantilla que hoy no valida sigue en el
  // catálogo y no debe ocultarse como retirada.
  const codes = new Set(catalogTemplates.map((raw) => (raw as { code?: string }).code ?? "?"));
  const seen = new Set<string>();
  for (const raw of catalogTemplates) {
    const code = (raw as { code?: string }).code ?? "?";
    try {
      if (seen.has(code)) throw new Error("duplicated code");
      seen.add(code);
      const entry = (await catalogTemplateSchema.validate(raw, { abortEarly: true })) as unknown as CatalogTemplate;
      await syncTemplate(entry, ownerId, subjects, collectionIds, report);
    } catch (error) {
      report.failed.push({ code, reason: (error as Error).message });
    }
  }

  // Lo que salió del catálogo se oculta; no se borra porque los docentes pueden tener copias.
  const stale = await prisma.ludiPlantilla.findMany({
    where: { codigo: { notIn: [...codes] }, actividad: { estatus: true } },
    select: { activityId: true, codigo: true },
  });
  for (const row of stale) {
    await prisma.ludiActividad.update({ where: { activityId: row.activityId }, data: { estatus: false } });
    report.retired.push(row.codigo);
  }
  return report;
}
