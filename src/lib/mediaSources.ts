// Rutas de Firebase Storage. Las reglas del bucket solo permiten escribir archivos
// directamente dentro de uploads/ (sin subcarpetas), así que el origen se marca con
// un prefijo en el nombre del archivo. Vive aquí (sin Prisma) para usarse también
// desde el navegador.

const UPLOADS_FOLDER = "uploads";

// Pixabay prohíbe enlazar sus URLs de forma permanente: las imágenes se copian a
// Storage y el prefijo permite seguir registrando su origen real en LudiRecurso.
export const PIXABAY_FILE_PREFIX = "pixabay_";
export const LESSON_FILE_PREFIX = "lesson_";
export const ANSWER_FILE_PREFIX = "answer_";
export const MEMORY_FILE_PREFIX = "memory_";

/** Ruta plana dentro de uploads/, con un nombre seguro para Storage y URLs. */
export function uploadsPath(prefix: string, fileName: string): string {
  const safeName = fileName.replace(/[^\w.-]+/g, "_");
  return `${UPLOADS_FOLDER}/${prefix}${Date.now()}_${safeName}`;
}

/** Reconoce las copias de Pixabay en una URL de descarga de Storage. */
export function isPixabayStorageUrl(url: string): boolean {
  // "uploads/pixabay/" cubre las copias guardadas con el esquema anterior de subcarpeta.
  return url.includes(encodeURIComponent(`${UPLOADS_FOLDER}/${PIXABAY_FILE_PREFIX}`))
    || url.includes(encodeURIComponent(`${UPLOADS_FOLDER}/pixabay/`));
}
