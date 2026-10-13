import prisma from "@/lib/db";
import { isPixabayStorageUrl } from "@/lib/mediaSources";
import type { LessonBlock } from "@/features/lesson/lessonBlocks";
import type { FormQuestion } from "@/features/form/formQuestions";
export { validateLessonForSave } from "@/features/lesson/lessonBlocks";
export { validateFormForSave } from "@/features/form/formQuestions";

// Map frontend types to DB IDs
const ACTIVITY_TYPE_MAP: Record<string, number> = {
  "ludiquiz": 1,
  "trueorfalse": 2,
  "ludimemory": 3,
  "ludileccion": 4,
  "ludiform": 5
};

// Debe coincidir con LUDI_ORIGEN_RECURSO / LUDI_TIPO_RECURSO (prisma/seed.ts).
const RESOURCE_ORIGIN_MAP: Record<string, number> = {
  "local": 1, // firebasestorage counts as local upload for this context
  "unsplash": 2,
  "youtube": 3,
  "freesound": 4,
  "pixabay": 5,
  "canva": 6
};

const RESOURCE_TYPE_MAP: Record<string, number> = {
  "image": 1,
  "video": 2,
  "audio": 3,
  "youtube": 2, // Youtube is video
  "canva": 4, // PRESENTACION
  "pdf": 5,
  "word": 6,
  "powerpoint": 7
};

/**
 * Resolves the Activity Type ID from the string key.
 */
export async function getActivityTypeId(typeKey: string): Promise<number> {
  // Try static map first for speed
  if (ACTIVITY_TYPE_MAP[typeKey]) return ACTIVITY_TYPE_MAP[typeKey];

  // Fallback to DB lookup
  const type = await prisma.ludiTipoActividad.findFirst({
    where: { nombre: typeKey.toUpperCase() }
  });

  if (!type) throw new Error(`Activity type '${typeKey}' not found in DB.`);
  return type.id;
}

/**
 * Resolves the Theme ID based on the image URL.
 */
export async function getThemeIdByUrl(url: string): Promise<number | null> {
  // Extract filename or unique part if possible, or search exact match
  // The frontend sends "/images/theme/tema4.jpg"
  const theme = await prisma.ludiTema.findFirst({
    where: {
      imageUrl: { contains: url },
      activo: true
    }
  });

  return theme ? Number(theme.id) : null;
}

/**
 * Determines Origin ID and Type ID from a URL and frontend type string.
 */
export function analyzeResource(url: string, type: string) {
  let originId = RESOURCE_ORIGIN_MAP["local"]; // Default
  let tipoId = RESOURCE_TYPE_MAP[type] || 1;

  if (url.includes("unsplash.com")) originId = RESOURCE_ORIGIN_MAP["unsplash"];
  else if (url.includes("youtube.com") || url.includes("youtu.be")) originId = RESOURCE_ORIGIN_MAP["youtube"];
  else if (url.includes("freesound.org")) originId = RESOURCE_ORIGIN_MAP["freesound"];
  else if (url.includes("canva.com/design/")) originId = RESOURCE_ORIGIN_MAP["canva"];
  else if (isPixabayStorageUrl(url)) originId = RESOURCE_ORIGIN_MAP["pixabay"];

  if (type === "youtube") tipoId = 2;

  return { originId, tipoId };
}

/**
 * Ensures a resource exists in the DB and returns its ID.
 */
export async function getOrCreateResource(tx: any, url: string, type: string, title?: string): Promise<bigint> {
  // Check if exists
  const existing = await tx.ludiRecurso.findFirst({
    where: { url: url }
  });

  if (existing) return existing.id;

  // Create new
  const { originId, tipoId } = analyzeResource(url, type);

  const newResource = await tx.ludiRecurso.create({
    data: {
      url,
      tipoId,
      origenId: originId, // Mapeo explícito: campo DB = variable local
      titulo: title || "Sin título",
      externalId: "auto-generated"
    }
  });

  return newResource.id;
}

/**
 * Reemplaza todos los bloques de una lección. Cada bloque es una LudiPregunta de
 * contenido (sin opciones ni tiempo), con su recurso en LUDI_PREGUNTA_RECURSO.
 */
export async function replaceLessonBlocks(tx: any, activityId: number, tipoActividadId: number, blocks: LessonBlock[]) {
  await deleteActivityQuestions(tx, activityId);

  for (const [index, block] of blocks.entries()) {
    const isReading = block.kind === "reading";
    const pregunta = await tx.ludiPregunta.create({
      data: {
        activity: { connect: { activityId } },
        numero: index + 1,
        enunciado: block.title.trim(),
        contenidoTexto: isReading ? (block.body ?? "").trim() : null,
        esContenido: true,
        tipoActividad: { connect: { id: tipoActividadId } },
        puntaje: null,
        tiempoLimiteMs: null,
      },
    });

    if (!isReading && block.url) {
      const recursoId = await getOrCreateResource(tx, block.url, block.kind, block.title.trim() || undefined);
      await tx.ludiPreguntaRecurso.create({
        data: {
          pregunta: { connect: { id: pregunta.id } },
          recurso: { connect: { id: recursoId } },
          rol: "principal",
        },
      });
    }
  }
}

/** Borra las preguntas de una actividad junto con sus respuestas, recursos y opciones. */
async function deleteActivityQuestions(tx: any, activityId: number) {
  const existing: { id: bigint }[] = await tx.ludiPregunta.findMany({ where: { activityId }, select: { id: true } });
  const ids = existing.map((q) => q.id);
  if (ids.length === 0) return;
  await tx.ludiRespuestaEstudiante.deleteMany({ where: { preguntaId: { in: ids } } });
  await tx.ludiPreguntaRecurso.deleteMany({ where: { preguntaId: { in: ids } } });
  await tx.ludiOpcionRecurso.deleteMany({ where: { opcion: { preguntaId: { in: ids } } } });
  await tx.ludiOpcion.deleteMany({ where: { preguntaId: { in: ids } } });
  await tx.ludiPregunta.deleteMany({ where: { id: { in: ids } } });
}

/**
 * Reemplaza todas las preguntas de un formulario. Sin tiempo límite; el puntaje
 * se guarda también en las de respuesta larga porque se otorga al aprobarlas.
 */
export async function replaceFormQuestions(tx: any, activityId: number, tipoActividadId: number, questions: FormQuestion[], points: number) {
  await deleteActivityQuestions(tx, activityId);

  for (const [index, question] of questions.entries()) {
    const pregunta = await tx.ludiPregunta.create({
      data: {
        activity: { connect: { activityId } },
        numero: index + 1,
        enunciado: question.text.trim(),
        tipoPregunta: question.type,
        tipoActividad: { connect: { id: tipoActividadId } },
        puntaje: points,
        tiempoLimiteMs: null,
      },
    });

    for (const [optionIndex, option] of question.options.entries()) {
      await tx.ludiOpcion.create({
        data: {
          pregunta: { connect: { id: pregunta.id } },
          indice: optionIndex + 1,
          texto: option.text.trim(),
          esCorrecta: option.isCorrect,
        },
      });
    }
  }
}

/**
 * Asigna (o quita) la imagen de una opción en LUDI_OPCION_RECURSO. Las URLs blob:
 * solo existen en el navegador que las creó, así que nunca se guardan.
 */
export async function setOptionImage(tx: any, opcionId: bigint, imageUrl: string | null | undefined) {
  await tx.ludiOpcionRecurso.deleteMany({ where: { opcionId } });
  if (!imageUrl || imageUrl.startsWith("blob:")) return;
  const recursoId = await getOrCreateResource(tx, imageUrl, "image");
  await tx.ludiOpcionRecurso.create({
    data: {
      opcion: { connect: { id: opcionId } },
      recurso: { connect: { id: recursoId } },
      rol: "principal",
    },
  });
}
