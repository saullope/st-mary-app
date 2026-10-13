// Enlaces de diseño de Canva: canva.com/design/<id>/<token>/<view|watch|edit>.
// Solo los enlaces de visualización se pueden incrustar; el de edición usa un
// token distinto que Canva rechaza dentro de un iframe.
const CANVA_DESIGN_RE = /canva\.com\/design\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\/(view|watch|edit)/i;

export type CanvaParseResult =
  | { ok: true; embedUrl: string }
  | { ok: false; reason: "empty" | "edit-link" | "invalid" };

/**
 * Convierte lo que pegue el docente (enlace "Ver" de Canva o el código
 * <iframe> de "Insertar") en la URL de inserción `/view?embed`.
 */
export function parseCanvaLink(input: string): CanvaParseResult {
  const value = input.trim();
  if (!value) return { ok: false, reason: "empty" };

  // Si pegó el código de inserción completo, tomar solo el src del iframe.
  const srcMatch = value.match(/src=["']([^"']+)["']/i);
  const candidate = srcMatch ? srcMatch[1] : value;

  const match = candidate.match(CANVA_DESIGN_RE);
  if (!match) return { ok: false, reason: "invalid" };

  const [, designId, token, mode] = match;
  if (mode.toLowerCase() === "edit") return { ok: false, reason: "edit-link" };

  return { ok: true, embedUrl: `https://www.canva.com/design/${designId}/${token}/view?embed` };
}

export function isCanvaUrl(url: string | null | undefined): boolean {
  return !!url && url.includes("canva.com/design/");
}
