import prisma from "@/lib/db";

// Map frontend types to DB IDs
const ACTIVITY_TYPE_MAP: Record<string, number> = {
  "ludiquiz": 1,
  "trueorfalse": 2,
  "ludimemory": 3
};

const RESOURCE_ORIGIN_MAP: Record<string, number> = {
  "local": 1, // firebasestorage counts as local upload for this context
  "unsplash": 2,
  "youtube": 3,
  "freesound": 4
};

const RESOURCE_TYPE_MAP: Record<string, number> = {
  "image": 1,
  "video": 2,
  "audio": 3,
  "youtube": 2 // Youtube is video
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
    where: { imageUrl: { contains: url } }
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
