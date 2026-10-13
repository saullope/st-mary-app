// LudiMemory: cada imagen forma una pareja (lados A y B en LUDI_MEMORIA_TARJETA).
// Vive sin dependencias de servidor para usarse en el editor, el reproductor y la API.

export const MEMORY_MIN_PAIRS = 2;
// 12 parejas = 24 cartas, el máximo que cabe legible en una pantalla de aula.
export const MEMORY_MAX_PAIRS = 12;

export interface MemoryCard {
  /** Único por carta. */
  key: string;
  pairId: string;
  imageUrl: string;
}

export interface MemoryPairSource {
  pairId: string;
  imageUrl: string;
}

/** Fisher-Yates; `random` se inyecta para poder probarlo. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Dos cartas por pareja, mezcladas. */
export function buildDeck(pairs: MemoryPairSource[], random: () => number = Math.random): MemoryCard[] {
  const cards = pairs.flatMap(({ pairId, imageUrl }) => [
    { key: `${pairId}-a`, pairId, imageUrl },
    { key: `${pairId}-b`, pairId, imageUrl },
  ]);
  return shuffle(cards, random);
}

/** Parejas jugables a partir de las parejas guardadas (primera tarjeta con imagen). */
export function pairsFromSession(memoriaParejas: unknown): MemoryPairSource[] {
  if (!Array.isArray(memoriaParejas)) return [];
  return memoriaParejas
    .map((pareja) => ({
      pairId: String(pareja?.id ?? ""),
      imageUrl: String(pareja?.tarjetas?.find((t: { recurso?: { url?: string } }) => t?.recurso?.url)?.recurso?.url ?? ""),
    }))
    .filter((pair) => pair.pairId && pair.imageUrl);
}

/** El tablero completo siempre vale lo mismo: los fallos cuentan para insignias, no restan puntos. */
export function memoryScore(totalPairs: number, pointsPerPair: number): number {
  return totalPairs * pointsPerPair;
}

/** Mensaje para el docente si el tablero no se puede guardar; null si está bien. */
export function validateMemoryForSave(images: string[] | undefined): string | null {
  const valid = (images ?? []).filter((url) => url.trim().length > 0);
  if (valid.length < MEMORY_MIN_PAIRS) return `Agrega al menos ${MEMORY_MIN_PAIRS} imágenes para la actividad LudiMemory.`;
  if (valid.length > MEMORY_MAX_PAIRS) return `LudiMemory admite hasta ${MEMORY_MAX_PAIRS} imágenes.`;
  if (new Set(valid).size !== valid.length) return "Hay imágenes repetidas en el tablero.";
  return null;
}
