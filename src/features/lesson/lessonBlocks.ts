// Modelo y reglas de los bloques de LudiLección. Sin dependencias de React ni
// de Prisma: lo usan el editor, el motor de juego y las Server Actions.

export type LessonBlockKind =
  | "canva"
  | "youtube"
  | "image"
  | "reading"
  | "audio"
  | "pdf"
  | "word"
  | "powerpoint";

export interface LessonBlock {
  id: number;
  kind: LessonBlockKind;
  title: string;
  /** URL del recurso; null en los bloques de lectura. */
  url: string | null;
  /** Texto de los bloques de lectura. */
  body?: string;
}

// Primero y segundo grado solo ven contenido básico; el resto se habilita desde tercero.
const BASIC_KINDS: LessonBlockKind[] = ["canva", "youtube", "image"];
const ADVANCED_MIN_GRADE = 3;

export const LESSON_BLOCK_KINDS: LessonBlockKind[] = [
  "canva",
  "youtube",
  "image",
  "reading",
  "audio",
  "pdf",
  "word",
  "powerpoint",
];

export const LESSON_BLOCK_LABELS: Record<LessonBlockKind, string> = {
  canva: "Canva",
  youtube: "YouTube",
  image: "Imagen",
  reading: "Lectura",
  audio: "Audio",
  pdf: "PDF",
  word: "Word",
  powerpoint: "PowerPoint",
};

export function isBlockAllowedForGrade(kind: LessonBlockKind, gradeId: number): boolean {
  return BASIC_KINDS.includes(kind) || gradeId >= ADVANCED_MIN_GRADE;
}

export function allowedBlockKinds(gradeId: number): LessonBlockKind[] {
  return LESSON_BLOCK_KINDS.filter((kind) => isBlockAllowedForGrade(kind, gradeId));
}

export const DOCUMENT_KINDS: LessonBlockKind[] = ["pdf", "word", "powerpoint"];

export const DOCUMENT_ACCEPT: Record<"pdf" | "word" | "powerpoint", string> = {
  pdf: ".pdf,application/pdf",
  word: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  powerpoint: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/** Valor de LudiTipoRecurso.nombre para cada bloque con recurso (ver prisma/seed.ts). */
export const LESSON_RESOURCE_TYPE: Record<Exclude<LessonBlockKind, "reading">, string> = {
  canva: "PRESENTACION",
  youtube: "VIDEO",
  image: "IMAGEN",
  audio: "AUDIO",
  pdf: "PDF",
  word: "WORD",
  powerpoint: "POWERPOINT",
};

/** Reconstruye el tipo de bloque a partir de lo persistido en LudiRecurso. */
export function kindFromResourceType(tipoNombre: string | null | undefined, url: string | null | undefined): LessonBlockKind {
  if (!url) return "reading";
  const tipo = (tipoNombre || "").toUpperCase().trim();
  const match = (Object.entries(LESSON_RESOURCE_TYPE) as [Exclude<LessonBlockKind, "reading">, string][])
    .find(([, nombre]) => nombre === tipo);
  return match ? match[0] : "image";
}

/** Visor embebible de Office; requiere que la URL del archivo sea pública. */
export function officeViewerUrl(fileUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

export function validateLessonBlock(block: LessonBlock): string | null {
  if (block.kind === "reading") {
    return block.body && block.body.trim() ? null : "Escribe el texto de la lectura.";
  }
  return block.url ? null : "Agrega el contenido del bloque.";
}

/** Devuelve el primer problema de una lección, o null si se puede guardar. */
export function validateLessonForSave(blocks: LessonBlock[] | undefined, gradeId: number): string | null {
  if (!blocks || blocks.length === 0) return "Agrega al menos un bloque a la lección.";
  for (const [index, block] of blocks.entries()) {
    // El editor ya oculta estos bloques; se revalida aquí porque el grado es una regla del producto.
    if (!isBlockAllowedForGrade(block.kind, gradeId)) {
      return `El bloque ${index + 1} (${LESSON_BLOCK_LABELS[block.kind]}) no está disponible para este grado.`;
    }
    const problem = validateLessonBlock(block);
    if (problem) return `Bloque ${index + 1}: ${problem}`;
  }
  return null;
}
